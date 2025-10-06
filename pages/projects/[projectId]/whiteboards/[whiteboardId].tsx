'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

interface Whiteboard {
  id: string;
  name: string;
  content: string;
  projectId: string;
}

export default function WhiteboardPage() {
  const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const { projectId, whiteboardId } = router.query;

  useEffect(() => {
    console.log("Current state:", { projectId, whiteboardId, isLoading });

    if (!projectId || !whiteboardId) {
      console.log("Missing IDs, waiting...");
      return;
    }

    const fetchWhiteboard = async () => {
      console.log("Fetching whiteboard data...");
      try {
        const res = await fetch(`/api/projects/${projectId}/whiteboards/${whiteboardId}`);
        console.log("Response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("Data received:", data);
          setWhiteboard(data.whiteboard);
          setIsOwner(data.isOwner);
        } else if (res.status === 403) {
          alert("You don't have access to this whiteboard");
          router.push(`/projects/${projectId}`);
        } else if (res.status === 404) {
          alert("Whiteboard not found");
          router.push(`/projects/${projectId}`);
        } else {
          alert("Failed to load whiteboard");
          router.push(`/projects/${projectId}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error loading whiteboard");
        router.push(`/projects/${projectId}`);
      } finally {
        setIsLoading(false);
        console.log("Loading finished");
      }
    };

    fetchWhiteboard();
  }, [projectId, whiteboardId, router]);

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading whiteboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            Project: {projectId}<br />
            Whiteboard: {whiteboardId}
          </p>
        </div>
      </div>
    );
  }

  if (!whiteboard) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Failed to load whiteboard</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Project</span>
          </button>
          <h1 className="text-xl font-semibold">{whiteboard.name}</h1>
        </div>
        <p className="text-sm text-gray-500">
          {isOwner ? "Owner" : "Viewer"}
        </p>
      </div>
      
      <div className="flex-1">
        <Tldraw 
          persistenceKey={`whiteboard-${whiteboard.id}`}
          // readOnly={!isOwner} // Uncomment to make read-only for non-owners
        />
      </div>
    </div>
  );
}