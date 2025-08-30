import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize monitoring system
    if (typeof window === 'undefined') {
      // Server-side initialization
      import('../src/lib/monitoring/init-monitoring').then(({ initializeMonitoring }) => {
        initializeMonitoring();
      });
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SGE Grants System - Impact Platform" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
