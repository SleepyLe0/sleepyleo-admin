import { NextResponse } from "next/server";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export async function GET() {
  if (!GITHUB_USERNAME) {
    return NextResponse.json(
      { error: "GitHub username not configured" },
      { status: 500 }
    );
  }

  try {
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "SleepyLeo-Hub",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      { headers, next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    const filteredRepos = repos
      .filter((repo) => !repo.fork && !repo.archived)
      .map((repo) => ({
        githubId: repo.id,
        name: repo.name,
        slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: repo.description,
        repoUrl: repo.html_url,
        liveUrl: repo.homepage,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        techStack: repo.topics || [],
        updatedAt: repo.pushed_at,
      }));

    return NextResponse.json({ repos: filteredRepos });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repos" },
      { status: 500 }
    );
  }
}
