import jwt from "jsonwebtoken";
import * as  cookie from "cookie";
import type { NextApiRequest } from "next";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function getUserFromRequest(req: NextApiRequest) {
  const cookies = cookie.parse(req.headers.cookie || "");
  console.log("Cookies:", cookies); // Debugging line
  const token = cookies.proj_session;
  console.log("Token:", token); // Debugging line
  if (!token) return null;

  try {
    const user = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    console.log("User:", user); // Debugging line
    return user;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}