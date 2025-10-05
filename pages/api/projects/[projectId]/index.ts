// pages/api/projects/[projectId]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUser = await getUserFromRequest(req);
  if (!sessionUser) return res.status(401).json({ error: "Not authenticated" });

  const { projectId } = req.query;

  if (req.method === "GET") {
    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId as string,
        OR: [
          { ownerId: sessionUser.id },
          { members: { some: { userId: sessionUser.id } } }
        ]
      },
      include: { owner: true }
    });

    if (!project) return res.status(403).json({ error: "Access denied" });

    const whiteboards = await prisma.whiteboard.findMany({
      where: { projectId: projectId as string },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ 
      project, 
      whiteboards,
      isOwner: project.ownerId === sessionUser.id
    });
  }

  if (req.method === "DELETE") {
    const project = await prisma.project.findFirst({
      where: { id: projectId as string, ownerId: sessionUser.id }
    });

    if (!project) return res.status(404).json({ error: "Project not found or access denied" });

    // Delete all related data
    await prisma.$transaction([
      prisma.whiteboard.deleteMany({ where: { projectId: projectId as string } }),
      prisma.projectMember.deleteMany({ where: { projectId: projectId as string } }),
      prisma.project.delete({ where: { id: projectId as string } })
    ]);

    return res.status(200).json({ message: "Project deleted successfully" });
  }

  return res.status(405).end();
}