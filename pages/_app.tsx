// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import "../styles/globals.css"
import Layout from "../components/Layout";

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // For debugging session or analytics
  }, []);

  return (
    <Layout>
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Component {...pageProps} />
    </main>
    </Layout>
  );
}
