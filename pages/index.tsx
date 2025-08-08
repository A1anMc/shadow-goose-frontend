import { getBranding } from '../src/lib/branding';
import { useRouter } from 'next/router';

export default function Home() {
  const branding = getBranding();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-sg-background text-sg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="sg-heading text-4xl font-bold text-sg-primary mb-4">
            {branding.name}
          </h1>
          <p className="text-lg text-sg-primary/80 mb-8">
            Grant Management & Impact Measurement Platform
          </p>
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="sg-heading text-xl font-semibold text-sg-primary mb-4">
              Welcome to NavImpact
            </h2>
            <p className="text-sm text-sg-primary/60 mb-6">
              Sign in to access your projects and grants
            </p>
            
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-sg-accent text-white py-2 px-4 rounded-md hover:bg-sg-accent/90 transition-colors"
            >
              Sign In
            </button>
            
            <div className="mt-4 text-xs text-sg-primary/40">
              <p>Test credentials: username: test, password: test</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-sg-accent/10 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-sg-primary/60">
              Branding applied: {branding.name}
            </p>
            <p className="text-sm text-sg-primary/60">
              Colors: Primary {branding.colors.primary}, Accent {branding.colors.accent}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
