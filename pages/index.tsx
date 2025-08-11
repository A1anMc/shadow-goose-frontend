import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBranding } from "../src/lib/branding";
import { authService } from "../src/lib/auth";

export default function Home() {
  const router = useRouter();
  const branding = getBranding();

  useEffect(() => {
    // Redirect based on authentication status
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-sg-background text-sg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
        <h1 className="sg-heading text-2xl font-bold text-sg-primary mt-4">
          {branding.name}
        </h1>
        <p className="text-sm text-sg-primary/60 mt-2">Loading...</p>
      </div>
    </main>
  );
}
