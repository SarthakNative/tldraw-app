import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromRequest } from "../../../lib/auth";

export default async function meRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  res.json({ user });
}