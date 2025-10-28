import React, { useState, useEffect } from "react";

const Header: React.FC = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-slate-800 text-white px-3 sm:px-6 py-4 shadow-xl border-b border-gray-700">
  <div className="max-w-8xl mx-auto flex items-center justify-between">
    {/* Left Section - Branding */}
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          CollabCanvas
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Collaborative Whiteboard</p>
      </div>
    </div>
    
    {/* Right Section - User Profile & Actions */}
    <div className="flex items-center gap-2 sm:gap-4">
      {!loading && user && (
        <div className="flex items-center gap-1 sm:gap-3 bg-gray-800/50 pl-2 pr-2 sm:px-4 py-2 rounded-xl border border-gray-700">
          {/* Profile Icon */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
            {getInitials(user.username)}
          </div>
          {/* Username - Hidden on mobile */}
          <div className="hidden sm:flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-white">Welcome back</span>
            <span className="text-xs sm:text-sm text-gray-300 truncate max-w-[100px] sm:max-w-[120px]">
              {user.username}
            </span>
          </div>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 shadow hover:shadow-xl flex items-center gap-1 cursor-pointer group flex-shrink-0"
        aria-label="Logout"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  </div>
</header>
  );
};

export default Header;