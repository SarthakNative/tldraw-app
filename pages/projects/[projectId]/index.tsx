// pages/projects/[projectId]/index.tsx
'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Whiteboard {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  owner: { username: string };
  ownerId: string;
}

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setWhiteboards(data.whiteboards || []);
        setIsOwner(data.isOwner);
      } else if (res.status === 401) {
        router.push("/login");
      } else if (res.status === 403) {
        router.push("/projects");
      }
    };

    fetchProjectData();
  }, [projectId, router]);

  const handleCreateWhiteboard = async () => {
    const name = prompt("Enter whiteboard name:");
    if (!name) return;

    const res = await fetch(`/api/projects/${projectId}/whiteboards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const { whiteboard } = await res.json();
      setWhiteboards((prev) => [...prev, whiteboard]);
    }
  };

  const handleDeleteWhiteboard = async (whiteboardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this whiteboard?")) return;

    const res = await fetch(`/api/projects/${projectId}/whiteboards/${whiteboardId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setWhiteboards((prev) => prev.filter(w => w.id !== whiteboardId));
    }
  };

  const openWhiteboard = (whiteboardId: string) => {
    router.push(`/projects/${projectId}/whiteboards/${whiteboardId}`);
  };

  if (!project) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
          <p className="text-sm text-gray-500">
            Owner: {project.owner.username}
          </p>
        </div>
        <button
          onClick={() => router.push("/projects")}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          ← Back to Projects
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Whiteboards</h2>
        <button
          onClick={handleCreateWhiteboard}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + New Whiteboard
        </button>
      </div>

      {whiteboards.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No whiteboards yet</p>
          <button
            onClick={handleCreateWhiteboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create your first whiteboard
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {whiteboards.map((whiteboard) => (
            <div
              key={whiteboard.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <div onClick={() => openWhiteboard(whiteboard.id)}>
                <h3 className="font-medium text-lg mb-2">{whiteboard.name}</h3>
                <p className="text-xs text-gray-500">
                  Created: {new Date(whiteboard.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {isOwner && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => handleDeleteWhiteboard(whiteboard.id, e)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}