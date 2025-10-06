import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET as string;

export default async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { username } = req.body;
  if (!username || typeof username !== "string")
    return res.status(400).json({ error: "username required" });

  const normalized = username.trim().toLowerCase();

  let user = await prisma.user.findUnique({
    where: { normalizedUsername: normalized },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username: username.trim(), normalizedUsername: normalized },
    });
  }

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
}