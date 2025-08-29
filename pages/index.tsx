import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "../src/lib/auth";
import { getBranding } from "../src/lib/branding";
import { logger } from "../src/lib/logger";

export default function Home() {
  const router = useRouter();
  const branding = getBranding();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Add a small delay to ensure localStorage is available
        await new Promise(resolve => setTimeout(resolve, 100));

        const isAuthenticated = authService.isAuthenticated();
        logger.info("Authentication check", { isAuthenticated });

        if (isAuthenticated) {
          logger.info("Redirecting to dashboard");
          router.push("/dashboard");
        } else {
          logger.info("Redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        logger.error("Auth check error", { error: error instanceof Error ? error.message : String(error) });
        setError("Authentication check failed. Please refresh the page.");
        // Fallback to login page
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Show error if authentication check failed
  if (error) {
    return (
      <main className="min-h-screen bg-sg-background text-sg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="sg-heading text-2xl font-bold text-sg-primary mt-4">
            {branding.name}
          </h1>
          <p className="text-sm text-red-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-sg-primary text-white rounded hover:bg-sg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sg-background text-sg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
        <h1 className="sg-heading text-2xl font-bold text-sg-primary mt-4">
          {branding.name}
        </h1>
        <p className="text-sm text-sg-primary/60 mt-2">
          {isLoading ? "Checking authentication..." : "Redirecting..."}
        </p>
      </div>
    </main>
  );
}
