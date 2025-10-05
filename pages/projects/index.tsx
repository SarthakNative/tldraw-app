'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Project {
  id: string;
  name: string;
  description: string;
  owner: { username: string };
}

export default function ProjectsPage() {
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        console.log("projects",data);
        setOwnedProjects(data.owned);
      } else if (res.status === 401) {
        router.push("/login");
      }
    };
    fetchProjects();
  }, [router]);

  const handleCreate = async () => {
    const name = prompt("Enter project name:");
    if (!name) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: "" }),
    });
    if (res.ok) {
      const { project } = await res.json();
      setOwnedProjects((prev) => [...(prev || []), project]);
    }
  };

  const openProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Projects</h1>
      <button
        onClick={handleCreate}
        className="bg-blue-600 text-white px-4 py-2 rounded-md mb-6"
      >
        + New Project
      </button>
      {(ownedProjects || []).length  === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul className="space-y-2 bg-red">
          {ownedProjects.map((p) => (
            <li
              key={p.id}
              onClick={() => openProject(p.id)}
              className="p-3 border rounded-md cursor-pointer hover:bg-gray-100"
            >
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm text-gray-500">
                Owner: {p?.owner?.username}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
