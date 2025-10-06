import React from "react";

const Header: React.FC = () => {
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

  return (
    <header className="flex items-center justify-between bg-gray-900 text-white px-6 py-4 shadow-md">
      <h1 className="text-xl font-semibold">MyApp</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded transition-colors"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;