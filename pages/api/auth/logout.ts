import type { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";

export default function logoutRoute(req: NextApiRequest, res: NextApiResponse) {
  // Clear the cookie
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("proj_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    })
  );

  res.json({ ok: true });
}