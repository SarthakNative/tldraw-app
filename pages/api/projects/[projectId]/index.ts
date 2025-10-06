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
      include: { owner: true, members: true }
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

  if (req.method === "PUT") {
    // Handle project update
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    try {
      // Check if project exists and user has permission to edit
      const project = await prisma.project.findFirst({
        where: {
          id: projectId as string,
          OR: [
            { ownerId: sessionUser.id }, // Owner can edit
            { members: { 
              some: { 
                userId: sessionUser.id,
              }
            }}
          ]
        }
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found or access denied" });
      }

      // Update the project
      const updatedProject = await prisma.project.update({
        where: { id: projectId as string },
        data: { 
          name: name.trim(), 
          description: description?.trim() || "" 
        },
        include: { owner: true, members: true }
      });

      return res.json({ project: updatedProject });
    } catch (error) {
      console.error("Failed to update project:", error);
      return res.status(500).json({ error: "Failed to update project" });
    }
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

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}