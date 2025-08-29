import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

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

  return <Component {...pageProps} />;
}
