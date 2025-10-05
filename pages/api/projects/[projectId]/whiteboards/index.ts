// pages/api/projects/[projectId]/whiteboards/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUser = await getUserFromRequest(req);
  if (!sessionUser) return res.status(401).json({ error: "Not authenticated" });

  const { projectId } = req.query;

  // Check if user has access to this project
  const projectAccess = await prisma.project.findFirst({
    where: {
      id: projectId as string,
      OR: [
        { ownerId: sessionUser.id },
        { members: { some: { userId: sessionUser.id } } }
      ]
    }
  });

  if (!projectAccess) return res.status(403).json({ error: "Access denied" });

  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Whiteboard name is required" });
    }

    const whiteboard = await prisma.whiteboard.create({
      data: {
        name,
        projectId: projectId as string,
        content: "{}" // Initial empty content
      }
    });

    return res.status(201).json({ whiteboard });
  }

  return res.status(405).end();
}