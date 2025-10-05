// pages/projects/index.tsx
'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Project {
  id: string;
  name: string;
  description: string;
  owner: { username: string };
  ownerId: string;
  members: { userId: string }[];
}

interface User {
  id: string;
  username: string;
}

export default function ProjectsPage() {
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [shareUsername, setShareUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      // Fetch current user
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData.user);
      }

      // Fetch projects
      const projectsRes = await fetch("/api/projects");
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setOwnedProjects(data.owned || []);
        setSharedProjects(data.shared || []);
      } else if (projectsRes.status === 401) {
        router.push("/login");
      }
    };
    fetchUserAndProjects();
  }, [router]);

  const handleCreate = async () => {
    const name = prompt("Enter project name:");
    const description = prompt("Enter project description:") || "";
    
    if (!name) return;
    
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    
    if (res.ok) {
      const { project } = await res.json();
      setOwnedProjects((prev) => [...prev, project]);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setOwnedProjects((prev) => prev.filter(p => p.id !== projectId));
    } else {
      alert("Failed to delete project");
    }
  };

  const handleShare = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowShareModal(true);
  };

  const executeShare = async () => {
    if (!selectedProject || !shareUsername.trim()) return;

    const res = await fetch(`/api/projects/${selectedProject.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: shareUsername.trim() }),
    });

    if (res.ok) {
      alert("Project shared successfully!");
      setShareUsername("");
      setShowShareModal(false);
      setSelectedProject(null);
    } else {
      const error = await res.json();
      alert(error.error || "Failed to share project");
    }
  };

  const openProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Projects</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>

      {/* Owned Projects */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Owned Projects</h2>
        {ownedProjects.length === 0 ? (
          <p className="text-gray-500">No projects found. Create your first project!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ownedProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
              >
                <div onClick={() => openProject(project.id)}>
                  <h3 className="font-medium text-lg mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <p className="text-xs text-gray-500">
                    Members: {project.members.length}
                  </p>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => handleShare(project, e)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Share
                  </button>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shared Projects */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Shared With You</h2>
        {sharedProjects.length === 0 ? (
          <p className="text-gray-500">No shared projects found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sharedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => openProject(project.id)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
              >
                <h3 className="font-medium text-lg mb-2">{project.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <p className="text-xs text-gray-500">
                  Owner: {project.owner.username}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Share Modal */}
      {showShareModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Share "{selectedProject.name}"
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter username to share this project with:
            </p>
            
            <input
              type="text"
              value={shareUsername}
              onChange={(e) => setShareUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full p-2 border rounded-md mb-4"
              onKeyPress={(e) => e.key === 'Enter' && executeShare()}
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedProject(null);
                  setShareUsername("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={executeShare}
                disabled={!shareUsername.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}