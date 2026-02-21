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
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        <div className="w-full flex justify-between items-center">
          <a
            href={siteUrl}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group w-fit"
          >
            <Home className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Site</span>
          </a>
          <div className="flex items-center gap-3">
            <Link
              href="/server-health"
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/50 px-4 py-2 transition-all hover:border-green-500/50 hover:bg-green-900/10"
            >
              <div className="inline-flex rounded-md bg-green-500/20 p-1.5 text-green-400 group-hover:text-green-300">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">Server Health</span>
              <ArrowRight className="h-4 w-4 text-green-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/intern"
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/50 px-4 py-2 transition-all hover:border-indigo-500/50 hover:bg-indigo-900/10"
            >
              <div className="inline-flex rounded-md bg-indigo-500/20 p-1.5 text-indigo-400 group-hover:text-indigo-300">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">AI Intern</span>
              <ArrowRight className="h-4 w-4 text-indigo-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/profile"
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/50 px-4 py-2 transition-all hover:border-indigo-500/50 hover:bg-indigo-900/10"
            >
              <div className="inline-flex rounded-md bg-indigo-500/20 p-1.5 text-indigo-400 group-hover:text-indigo-300">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">Profile</span>
              <ArrowRight className="h-4 w-4 text-indigo-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/skills"
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/50 px-4 py-2 transition-all hover:border-violet-500/50 hover:bg-violet-900/10"
            >
              <div className="inline-flex rounded-md bg-violet-500/20 p-1.5 text-violet-400 group-hover:text-violet-300">
                <Code2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">Skills</span>
              <ArrowRight className="h-4 w-4 text-violet-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Project Manager
            </h1>
            <p className="text-neutral-400">
              Import projects from GitHub, manage visibility, and customize details.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LogoutButton />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">Manage Projects</h2>
        <ProjectManager />
      </div>
    </div>
  );
}
