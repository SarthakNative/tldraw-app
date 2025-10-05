import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/auth";

async function userHasAccess(userId: string, projectId: string) {
  if (!userId) return false;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return false;

  if (project.ownerId === userId) return true;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } } as any,
  });

  return !!member;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUser = getUserFromRequest(req);
  if (!sessionUser) return res.status(401).json({ error: "not authenticated" });

  const { projectId } = req.query as { projectId: string };

  if (req.method === "GET") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        members: { include: { user: true } },
        whiteboards: true,
      },
    });
    if (!project) return res.status(404).json({ error: "not found" });

    const has = await userHasAccess(sessionUser.id, projectId);
    if (!has) return res.status(403).json({ error: "forbidden" });

    return res.json({ project });
  }

  if (req.method === "PUT") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return res.status(404).json({ error: "not found" });
    if (project.ownerId !== sessionUser.id)
      return res.status(403).json({ error: "forbidden" });

    const { name, description } = req.body;
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name, description },
    });

    return res.json({ project: updated });
  }

  return res.status(405).end();
}