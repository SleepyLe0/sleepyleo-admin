"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Github,
  Star,
  GitFork,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  techStack: string[];
  memeUrl?: string | null;
  repoUrl?: string | null;
  liveUrl?: string | null;
  visible: boolean;
  featured: boolean;
  githubId?: number | null;
  stars: number;
  forks: number;
  language?: string | null;
}

interface GitHubRepo {
  githubId: number;
  name: string;
  slug: string;
  description: string | null;
  repoUrl: string;
  liveUrl: string | null;
  stars: number;
  forks: number;
  language: string | null;
  techStack: string[];
}

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Fetch projects from database
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch repos from GitHub
  const fetchGitHubRepos = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/github");
      const data = await response.json();
      if (data.repos) {
        setGithubRepos(data.repos);
      }
    } catch (error) {
      console.error("Failed to fetch GitHub repos:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Import repo from GitHub
  const importRepo = async (repo: GitHubRepo) => {
    setImportingId(repo.githubId);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repo),
      });

      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error("Failed to import repo:", error);
    } finally {
      setImportingId(null);
    }
  };

  // Toggle project visibility
  const toggleVisibility = async (project: Project) => {
    try {
      const response = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, visible: !project.visible }),
      });

      if (response.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id ? { ...p, visible: !p.visible } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    }
  };

  // Toggle project featured status
  const toggleFeatured = async (project: Project) => {
    try {
      const response = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, featured: !project.featured }),
      });

      if (response.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id ? { ...p, featured: !p.featured } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  // Update project
  const updateProject = async (data: Partial<Project>) => {
    if (!editProject) return;

    try {
      const response = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editProject.id, ...data }),
      });

      if (response.ok) {
        await fetchProjects();
        setEditProject(null);
      }
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  // Check if repo is already imported
  const isRepoImported = (githubId: number) =>
    projects.some((p) => p.githubId === githubId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => {
            fetchGitHubRepos();
            setShowImportDialog(true);
          }}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Github className="h-4 w-4 mr-2" />
          )}
          Import from GitHub
        </Button>
        <Button variant="outline" onClick={fetchProjects}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="py-12 text-center">
              <p className="text-neutral-400 mb-4">No projects yet</p>
              <Button
                onClick={() => {
                  fetchGitHubRepos();
                  setShowImportDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Import your first project
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "bg-neutral-900 border-neutral-800 transition-opacity",
                !project.visible && "opacity-60"
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {project.name}
                      </h3>
                      {project.featured && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {project.githubId && (
                        <Badge variant="outline" className="text-neutral-400">
                          <Github className="h-3 w-3 mr-1" />
                          Synced
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400 truncate">
                      {project.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      {project.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          {project.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {project.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        {project.forks}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">
                        {project.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </span>
                      <Switch
                        checked={project.visible}
                        onCheckedChange={() => toggleVisibility(project)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-neutral-400" />
                      <Switch
                        checked={project.featured}
                        onCheckedChange={() => toggleFeatured(project)}
                      />
                    </div>

                    <div className="flex gap-2">
                      {project.repoUrl && (
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditProject(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">
              Import from GitHub
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {syncing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : githubRepos.length === 0 ? (
              <p className="text-neutral-400 text-center py-12">
                No repositories found. Make sure GITHUB_USERNAME is configured.
              </p>
            ) : (
              githubRepos.map((repo) => {
                const imported = isRepoImported(repo.githubId);
                return (
                  <div
                    key={repo.githubId}
                    className={cn(
                      "p-3 rounded-lg border flex items-center gap-4",
                      imported
                        ? "bg-green-900/20 border-green-500/30"
                        : "bg-neutral-800 border-neutral-700"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {repo.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {repo.description || "No description"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                        {repo.language && <span>{repo.language}</span>}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={imported ? "outline" : "default"}
                      disabled={imported || importingId === repo.githubId}
                      onClick={() => importRepo(repo)}
                    >
                      {importingId === repo.githubId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : imported ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Imported
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Project</DialogTitle>
          </DialogHeader>
          {editProject && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateProject({
                  name: formData.get("name") as string,
                  description: formData.get("description") as string,
                  liveUrl: formData.get("liveUrl") as string,
                  memeUrl: formData.get("memeUrl") as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-neutral-400">Name</label>
                <Input
                  name="name"
                  defaultValue={editProject.name}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400">Description</label>
                <Input
                  name="description"
                  defaultValue={editProject.description || ""}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400">Live URL</label>
                <Input
                  name="liveUrl"
                  defaultValue={editProject.liveUrl || ""}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400">Meme GIF URL</label>
                <Input
                  name="memeUrl"
                  defaultValue={editProject.memeUrl || ""}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="https://media.giphy.com/..."
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
