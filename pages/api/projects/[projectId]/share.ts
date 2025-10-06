import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUser = await getUserFromRequest(req);
  if (!sessionUser) return res.status(401).json({ error: "Not authenticated" });

  const { projectId } = req.query;

  if (req.method === "POST") {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Verify project exists and user is owner
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId as string, 
        ownerId: sessionUser.id 
      }
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found or access denied" });
    }

    // Find user to share with
    const userToShare = await prisma.user.findUnique({
      where: { normalizedUsername:username }
    });

    if (!userToShare) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToShare.id === sessionUser.id) {
      return res.status(400).json({ error: "Cannot share with yourself" });
    }

    // Check if already shared
    const existingShare = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId as string,
        userId: userToShare.id
      }
    });

    if (existingShare) {
      return res.status(400).json({ error: "Project already shared with this user" });
    }

    // Create share
    await prisma.projectMember.create({
      data: {
        projectId: projectId as string,
        userId: userToShare.id
      }
    });

    return res.status(200).json({ message: "Project shared successfully" });
  }

  return res.status(405).end();
}