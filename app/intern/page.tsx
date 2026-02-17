import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { ChatUI } from "@/components/chat-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MessageSquare, FolderSearch, Settings, Sparkles, ArrowLeft, Cat } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Intern",
  description: "An AI assistant powered by Gemini that understands natural language and executes commands for you.",
};

const examples = [
  {
    icon: FolderSearch,
    title: "File Operations",
    description: "\"Show me all files in this folder\" or \"Find all .tsx files\"",
  },
  {
    icon: Settings,
    title: "System Info",
    description: "\"What's my computer name?\" or \"Show system info\"",
  },
  {
    icon: MessageSquare,
    title: "Development",
    description: "\"Check my Node version\" or \"List running processes\"",
  },
  {
    icon: Sparkles,
    title: "Just Chat",
    description: "\"Hello!\" or ask questions about what I can do",
  },
];

export default async function InternPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header with back button */}
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

      {/* Main content - centered */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-8">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Leo&apos;s AI Intern
            </h1>
            <p className="text-neutral-400 text-base max-w-xl mx-auto">
              Meet my AI-powered intern! Tell it what you need in plain English
              and it&apos;ll figure out the right commands. Powered by Gemini 2.5.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatUI />
            </div>

            <div className="space-y-4">
              <Card className="bg-yellow-900/30 border-yellow-500/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-400 flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4" />
                    Safety Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-yellow-200/80 text-sm">
                    This runs on Leo&apos;s server. The AI avoids dangerous commands,
                    but please review what it&apos;s doing!
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base">Try Asking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {examples.map((example, index) => {
                    const Icon = example.icon;
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{example.title}</p>
                          <p className="text-xs text-neutral-400">{example.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-indigo-900/30 border-indigo-500/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-indigo-400 flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-indigo-200/80 text-sm">
                    I remember context! Say &ldquo;now show me only the TypeScript files&rdquo;
                    after listing a directory.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
