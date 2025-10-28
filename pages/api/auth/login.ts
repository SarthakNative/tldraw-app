import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Retry utility function
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Retry on connection-related errors
      if (error.code && ['P1001', 'P1017', 'P2028', 'P2034'].includes(error.code)) {
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Database operation failed (attempt ${attempt + 1}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      break;
    }
  }
  
  throw lastError!;
}

export default async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { username } = req.body;
  if (!username || typeof username !== "string")
    return res.status(400).json({ error: "username required" });

  const normalized = username.trim().toLowerCase();
  const trimmedUsername = username.trim();

  try {
    // Use upsert to handle both find and create in one atomic operation
    const user = await withRetry(async () => {
      return await prisma.user.upsert({
        where: { normalizedUsername: normalized },
        update: {
          // Update last login time if you have that field
          // lastLoginAt: new Date()
        },
        create: { 
          username: trimmedUsername, 
          normalizedUsername: normalized 
        },
      });
    });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("proj_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    );

    return res.json({ ok: true, user: { id: user.id, username: user.username } });

  } catch (error: any) {
    console.error("Login route error:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P1001') {
      return res.status(503).json({ 
        error: "Service temporarily unavailable. Please try again.",
        retry: true 
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: "User already exists with different credentials." 
      });
    }

    return res.status(500).json({ 
      error: "Login failed. Please try again.",
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
}