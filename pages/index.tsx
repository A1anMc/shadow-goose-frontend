import { getBranding } from "../src/lib/branding";

export default function Home() {
  const branding = getBranding();

  return (
    <main className="min-h-screen bg-sg-background text-sg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="sg-heading text-4xl font-bold text-sg-primary mb-4">
            {branding.name}
          </h1>
          <p className="text-lg text-sg-primary/80">Staging Environment</p>
          <div className="mt-8 p-4 bg-sg-accent/10 rounded-lg">
            <p className="text-sm text-sg-primary/60">
              Branding applied: {branding.name}
            </p>
            <p className="text-sm text-sg-primary/60">
              Colors: Primary {branding.colors.primary}, Accent{" "}
              {branding.colors.accent}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
