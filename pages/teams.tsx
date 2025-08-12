import dynamic from "next/dynamic";

// Lazy load to reduce bundle size if not needed elsewhere
const TeamTabs = dynamic(() => import("../src/components/TeamTabs"), {
  ssr: false,
});

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <TeamTabs />
    </main>
  );
}
