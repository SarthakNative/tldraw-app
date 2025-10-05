import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUser = getUserFromRequest(req);
  if (!sessionUser) return res.status(401).json({ error: "not authenticated" });

  if (req.method === "GET") {
    const userId = sessionUser.id; 

    const owned = await prisma.project.findMany({
      where: { ownerId: userId },
      include: { owner: true, members: true },
    });

    const shared = await prisma.project.findMany({
      where: {
        members: { some: { userId } },
        NOT: { ownerId: userId },
      },
      include: { owner: true, members: true },
    });

    return res.json({ owned, shared });
  }

  if (req.method === "POST") {
    const { name, description } = req.body;
  
      if (!name) return res.status(400).json({ error: "name required" });

  // Verify the user exists
  const userExists = await prisma.user.findUnique({
    where: { id: sessionUser.id }
  });

  if (!userExists) {
    return res.status(400).json({ error: "Invalid user" });
  }

  const project = await prisma.project.create({
    data: { name, description, ownerId: sessionUser.id },
  });

    await prisma.projectMember.create({
      data: { projectId: project.id, userId: sessionUser.id },
    });

    return res.status(201).json({ project });
  }

  return res.status(405).end();
}