// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // For debugging session or analytics
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Component {...pageProps} />
    </main>
  );
}
