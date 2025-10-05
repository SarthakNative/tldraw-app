// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) router.replace("/projects");
        else router.replace("/login");
      } else router.replace("/login");
    }
    checkSession();
  }, [router]);

  return <p className="p-4 text-center">Loading...</p>;
}
