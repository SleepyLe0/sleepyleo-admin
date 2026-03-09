import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { ProjectManager } from "@/components/project-manager";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { Bot, ArrowRight, Activity, Home, User, Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - Project Manager",
  description: "Manage your portfolio projects",
};

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-neutral-950 py-6 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:gap-5">

        {/* Top bar: back link + nav links */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={siteUrl}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group w-fit"
          >
            <Home className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Site</span>
          </a>

          {/* Nav pills — wrap on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/server-health"
              className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-1.5 transition-all hover:border-green-500/50 hover:bg-green-900/10"
            >
              <div className="inline-flex rounded-md bg-green-500/20 p-1 text-green-400 group-hover:text-green-300">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-white">Server Health</span>
              <ArrowRight className="h-3.5 w-3.5 text-green-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/intern"
              className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-1.5 transition-all hover:border-indigo-500/50 hover:bg-indigo-900/10"
            >
              <div className="inline-flex rounded-md bg-indigo-500/20 p-1 text-indigo-400 group-hover:text-indigo-300">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-white">AI Intern</span>
              <ArrowRight className="h-3.5 w-3.5 text-indigo-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/profile"
              className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-1.5 transition-all hover:border-indigo-500/50 hover:bg-indigo-900/10"
            >
              <div className="inline-flex rounded-md bg-indigo-500/20 p-1 text-indigo-400 group-hover:text-indigo-300">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-white">Profile</span>
              <ArrowRight className="h-3.5 w-3.5 text-indigo-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/skills"
              className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-1.5 transition-all hover:border-violet-500/50 hover:bg-violet-900/10"
            >
              <div className="inline-flex rounded-md bg-violet-500/20 p-1 text-violet-400 group-hover:text-violet-300">
                <Code2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-white">Skills</span>
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Heading + logout */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
              Project Manager
            </h1>
            <p className="text-neutral-400 text-sm">
              Import projects from GitHub, manage visibility, and customize details.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
            <LogoutButton />
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-white">Manage Projects</h2>
        <ProjectManager />
      </div>
    </div>
  );
}
