'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Tldraw, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";

interface Whiteboard {
  id: string;
  name: string;
  content: string;
}

export default function TLDrawEditor() {
  const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null);
  const [store, setStore] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const { projectId, whiteboardId } = router.query;

  useEffect(() => {
    if (!projectId || !whiteboardId) return;

    const fetchWhiteboard = async () => {
      const res = await fetch(`/api/projects/${projectId}/whiteboards/${whiteboardId}`);
      if (res.ok) {
        const data = await res.json();
        setWhiteboard(data.whiteboard);
        
        const store = createTLStore({ shapeUtils: defaultShapeUtils });
        if (data.whiteboard.content) {
          store.loadStoreSnapshot(JSON.parse(data.whiteboard.content));
        }
        setStore(store);
      }
    };

    fetchWhiteboard();
  }, [projectId, whiteboardId]);

  const handleSave = async () => {
    if (!store || !projectId || !whiteboardId) return;

    setIsSaving(true);
    const snapshot = store.getSnapshot();
    
    await fetch(`/api/projects/${projectId}/whiteboards/${whiteboardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: snapshot }),
    });
    
    setIsSaving(false);
  };

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  if (!store || !whiteboard) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">{whiteboard.name}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`text-sm ${isSaving ? 'text-orange-500' : 'text-green-500'}`}>
            {isSaving ? 'Saving...' : 'Saved'}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Save
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <Tldraw store={store} />
      </div>
    </div>
  );
}