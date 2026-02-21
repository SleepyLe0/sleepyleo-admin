import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile-editor";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Profile Editor - Admin",
};

export default async function ProfilePage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <LogoutButton />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Profile Editor</h1>
          <p className="text-neutral-400 text-sm">Manage your About & Contact section content.</p>
        </div>

        <ProfileEditor />
      </div>
    </div>
  );
}
