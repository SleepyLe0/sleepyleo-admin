import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { HealthDashboard } from "@/components/health-dashboard";
import Link from "next/link";
import { ArrowLeft, Cat } from "lucide-react";

export const metadata: Metadata = {
  title: "Server Health",
  description: "Real-time monitoring of server resources.",
};

export default async function ServerHealthPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-neutral-500">
            <Cat className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium hidden sm:inline">SleepyLeo Admin</span>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Server Health
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Real-time monitoring of the hamster wheel that powers this site.
              Updates every 5 minutes because watching paint dry is too exciting.
            </p>
          </div>

          <HealthDashboard />
        </div>
      </main>
    </div>
  );
}
