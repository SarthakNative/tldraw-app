import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession,setChheckingsession]=useState(true);
  const router = useRouter();

    useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.replace("/projects");
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
      finally{
      setChheckingsession(false);
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      router.push("/projects");
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.error || "Login failed");
    }
    setLoading(false);
  };

return checkingSession ? (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <p className="text-gray-600 text-lg font-medium">Checking session...</p>
  </div>
) : (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border w-full px-4 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Continue"}
      </button>
    </form>
  </div>
);
}
