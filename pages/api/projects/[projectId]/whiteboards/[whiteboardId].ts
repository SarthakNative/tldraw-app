// pages/api/projects/[projectId]/whiteboards/[whiteboardId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUser = await getUserFromRequest(req);
  if (!sessionUser) return res.status(401).json({ error: "Not authenticated" });

  const { projectId, whiteboardId } = req.query;

  // Check if user has access to this project
  const projectAccess = await prisma.project.findFirst({
    where: {
      id: projectId as string,
      OR: [
        { ownerId: sessionUser.id },
        { members: { some: { userId: sessionUser.id } } }
      ]
    },
    include: { owner: true }
  });

  if (!projectAccess) return res.status(403).json({ error: "Access denied" });

  const isOwner = projectAccess.ownerId === sessionUser.id;

  if (req.method === "GET") {
    const whiteboard = await prisma.whiteboard.findFirst({
      where: { 
        id: whiteboardId as string,
        projectId: projectId as string
      }
    });

    if (!whiteboard) return res.status(404).json({ error: "Whiteboard not found" });

    return res.json({ whiteboard, isOwner });
  }

  if (req.method === "PUT") {
  const { content } = req.body;

  // First verify the whiteboard exists and belongs to the project
  const existingWhiteboard = await prisma.whiteboard.findFirst({
    where: {
      id: whiteboardId as string,
      projectId: projectId as string
    }
  });

  if (!existingWhiteboard) {
    return res.status(404).json({ error: "Whiteboard not found" });
  }

  // Then update by id only
  const whiteboard = await prisma.whiteboard.update({
    where: { id: whiteboardId as string },
    data: { content: JSON.stringify(content) }
  });

  return res.json({ whiteboard });
}

  if (req.method === "DELETE") {
    if (!isOwner) {
      return res.status(403).json({ error: "Only project owner can delete whiteboards" });
    }

    await prisma.whiteboard.deleteMany({
      where: { 
        id: whiteboardId as string,
        projectId: projectId as string
      }
    });

    return res.status(200).json({ message: "Whiteboard deleted successfully" });
  }

  return res.status(405).end();
}