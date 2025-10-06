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
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [whiteboardName, setWhiteboardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    whiteboardId: string | null;
    whiteboardName: string | null;
  }>({ show: false, whiteboardId: null, whiteboardName: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, router]);

  const handleCreateWhiteboard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whiteboardName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/whiteboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: whiteboardName.trim() }),
      });

      if (res.ok) {
        const { whiteboard } = await res.json();
        setWhiteboards((prev) => [...prev, whiteboard]);
        setWhiteboardName("");
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create whiteboard:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWhiteboard = async () => {
    if (!deleteModal.whiteboardId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/whiteboards/${deleteModal.whiteboardId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setWhiteboards((prev) => prev.filter(w => w.id !== deleteModal.whiteboardId));
        setDeleteModal({ show: false, whiteboardId: null, whiteboardName: null });
      }
    } catch (error) {
      console.error("Failed to delete whiteboard:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openWhiteboard = (whiteboardId: string) => {
    router.push(`/projects/${projectId}/whiteboards/${whiteboardId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => router.push("/projects")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="mb-6 sm:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.push("/projects")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Projects
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 text-lg mb-3">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Owner: {project.owner.username}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {whiteboards.length} whiteboard{whiteboards.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {isOwner && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Whiteboard
            </button>
          )}
        </div>

        {/* Whiteboards Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-gray-900">Whiteboards</h2>
            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
              {whiteboards.length}
            </span>
          </div>
          
          {whiteboards.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No whiteboards yet</h3>
              <p className="text-gray-600 mb-6">Create your first whiteboard to start drawing and collaborating</p>
              {isOwner && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Create Whiteboard
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {whiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
                >
                  <div 
                    onClick={() => openWhiteboard(whiteboard.id)}
                    className="p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(whiteboard.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {whiteboard.name}
                    </h3>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created: {new Date(whiteboard.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({
                            show: true,
                            whiteboardId: whiteboard.id,
                            whiteboardName: whiteboard.name
                          });
                        }}
                        className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Whiteboard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Whiteboard</h2>
            <p className="text-gray-600 mb-6">Start a new collaborative drawing space</p>
            
            <form onSubmit={handleCreateWhiteboard}>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Whiteboard Name *
                </label>
                <input
                  type="text"
                  value={whiteboardName}
                  onChange={(e) => setWhiteboardName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter whiteboard name"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setWhiteboardName("");
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isCreating || !whiteboardName.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Whiteboard"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Delete Whiteboard</h2>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteModal.whiteboardName}"</span>? 
              This will permanently delete all drawings and content.
            </p>
            <p className="text-red-600 text-sm text-center font-medium mb-6">
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteModal({ show: false, whiteboardId: null, whiteboardName: null })}
                disabled={isDeleting}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteWhiteboard}
                disabled={isDeleting}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Whiteboard"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}