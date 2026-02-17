"use server";

import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";
import os from "os";
import { Duplex } from "stream";
import { Client } from "ssh2";

// VM connection settings via Cloudflare Access
const VM_HOST = process.env.VM_SSH_HOST;
const VM_USER = process.env.VM_SSH_USER || "root";
const VM_PASSWORD = process.env.VM_SSH_PASSWORD;

export async function getProjects(includeHidden = false) {
  if (!prisma) {
    return { success: false, data: [], error: "Database not configured" };
  }

  try {
    const projects = await prisma.project.findMany({
      where: includeHidden ? {} : { visible: true },
      orderBy: [{ featured: "desc" }, { stars: "desc" }, { updatedAt: "desc" }],
    });
    return { success: true, data: projects };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { success: false, data: [], error: "Failed to fetch projects" };
  }
}

export async function createProject(data: {
  name: string;
  slug: string;
  description?: string;
  techStack: string[];
  memeUrl?: string;
  repoUrl?: string;
  liveUrl?: string;
}) {
  if (!prisma) {
    return { success: false, error: "Database not configured" };
  }

  try {
    const project = await prisma.project.create({
      data,
    });
    return { success: true, data: project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function executeCommand(command: string): Promise<{
  success: boolean;
  output?: string;
  error?: string;
}> {
  // Basic command sanitization - block dangerous commands
  const blockedCommands = [
    "rm -rf",
    "rm -r /",
    "mkfs",
    "dd if=",
    "> /dev/",
    "chmod -R 777 /",
    ":(){ :|:& };:",
    "wget",
    "curl",
    "nc ",
    "netcat",
  ];

  const lowerCommand = command.toLowerCase();
  for (const blocked of blockedCommands) {
    if (lowerCommand.includes(blocked)) {
      return {
        success: false,
        error: `Command blocked for safety: contains "${blocked}"`,
      };
    }
  }

  if (!VM_HOST) {
    return {
      success: false,
      error: "VM_SSH_HOST environment variable not configured",
    };
  }

  if (!VM_PASSWORD) {
    return {
      success: false,
      error: "VM_SSH_PASSWORD environment variable not configured",
    };
  }

  try {
    const result = await executeRemoteCommand(command);
    return result;
  } catch (error) {
    const execError = error as { message: string };
    return {
      success: false,
      error: execError.message || "Failed to execute remote command",
    };
  }
}

async function executeRemoteCommand(command: string): Promise<{
  success: boolean;
  output?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const conn = new Client();
    let stdout = "";
    let stderr = "";
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        conn.end();
        resolve({
          success: false,
          error: "Command timed out after 5 minutes",
        });
      }
    }, 300000);

    const cloudflared = spawn("cloudflared", ["access", "ssh", "--hostname", VM_HOST!], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let cloudflaredClosed = false;

    cloudflared.stdin.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "EPIPE") {
        cloudflaredClosed = true;
      } else {
        console.error("cloudflared stdin error:", err);
      }
    });

    const duplexStream = new Duplex({
      read() { },
      write(chunk, encoding, callback) {
        if (cloudflaredClosed || !cloudflared.stdin.writable) {
          callback(new Error("cloudflared connection closed"));
          return;
        }
        try {
          cloudflared.stdin.write(chunk, encoding, callback);
        } catch (err) {
          callback(err as Error);
        }
      },
      final(callback) {
        if (cloudflaredClosed || !cloudflared.stdin.writable) {
          callback();
          return;
        }
        try {
          cloudflared.stdin.end(callback);
        } catch {
          callback();
        }
      },
    });

    cloudflared.stdout.on("data", (data) => {
      duplexStream.push(data);
    });

    cloudflared.stdout.on("end", () => {
      duplexStream.push(null);
    });

    cloudflared.stderr.on("data", (data) => {
      console.error("cloudflared stderr:", data.toString());
    });

    conn.on("ready", () => {
      conn.exec(command, (err, channel) => {
        if (err) {
          clearTimeout(timeout);
          if (!resolved) {
            resolved = true;
            conn.end();
            cloudflared.kill();
            resolve({
              success: false,
              error: `SSH exec error: ${err.message}`,
            });
          }
          return;
        }

        channel.on("close", (code: number) => {
          clearTimeout(timeout);
          if (!resolved) {
            resolved = true;
            conn.end();
            cloudflared.kill();
            if (code === 0) {
              resolve({
                success: true,
                output: stdout || stderr || "Command executed successfully (no output)",
              });
            } else {
              resolve({
                success: false,
                error: stderr || stdout || `Command exited with code ${code}`,
              });
            }
          }
        });

        channel.on("data", (data: Buffer) => {
          stdout += data.toString();
        });

        channel.stderr.on("data", (data: Buffer) => {
          stderr += data.toString();
        });
      });
    });

    conn.on("error", (err) => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        cloudflared.kill();
        resolve({
          success: false,
          error: `SSH connection error: ${err.message}`,
        });
      }
    });

    cloudflared.on("error", (err) => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        conn.end();
        resolve({
          success: false,
          error: `Cloudflared error: ${err.message}`,
        });
      }
    });

    cloudflared.on("close", (code) => {
      if (!resolved && code !== 0) {
        resolved = true;
        conn.end();
        resolve({
          success: false,
          error: `Cloudflared exited with code ${code}`,
        });
      }
    });

    conn.connect({
      sock: duplexStream,
      username: VM_USER,
      password: VM_PASSWORD,
    });
  });
}

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
}

export async function syncGitHubProjects() {
  if (!prisma) {
    return { success: false, error: "Database not configured" };
  }

  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return { success: false, error: "GitHub username not configured" };
  }

  try {
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "SleepyLeo-Hub",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers, cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    const filteredRepos = repos.filter((repo) => !repo.fork && !repo.archived);

    for (const repo of filteredRepos) {
      const slug = repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const existing = await prisma.project.findUnique({
        where: { githubId: repo.id },
      });

      if (existing) {
        await prisma.project.update({
          where: { githubId: repo.id },
          data: {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            description: repo.description || existing.description,
          },
        });
      } else {
        const slugExists = await prisma.project.findUnique({
          where: { slug },
        });

        await prisma.project.create({
          data: {
            githubId: repo.id,
            name: repo.name,
            slug: slugExists ? `${slug}-${repo.id}` : slug,
            description: repo.description,
            repoUrl: repo.html_url,
            liveUrl: repo.homepage,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            techStack: repo.topics || [],
            visible: true,
          },
        });
      }
    }

    return { success: true, synced: filteredRepos.length };
  } catch (error) {
    console.error("Failed to sync GitHub projects:", error);
    return { success: false, error: "Failed to sync GitHub projects" };
  }
}

export async function getSystemHealth(): Promise<{
  cpu: number;
  memory: {
    total: number;
    used: number;
    percentage: number;
  };
  uptime: number;
  platform: string;
  hostname: string;
}> {
  if (!VM_HOST || !VM_PASSWORD) {
    return getLocalSystemHealth();
  }

  try {
    const healthCommand = `
      cpu_usage=$(awk '/^cpu / {idle=$5; total=$2+$3+$4+$5+$6+$7+$8; print int(100*(total-idle)/total)}' /proc/stat 2>/dev/null || echo "0")
      echo "{
        \\"cpu\\": $cpu_usage,
        \\"memTotal\\": $(free -b | awk '/Mem:/ {print $2}'),
        \\"memUsed\\": $(free -b | awk '/Mem:/ {print $3}'),
        \\"uptime\\": $(cat /proc/uptime | awk '{print int($1)}'),
        \\"platform\\": \\"$(uname -s | tr '[:upper:]' '[:lower:]')\\",
        \\"hostname\\": \\"$(hostname)\\"
      }"
    `.trim();

    const result = await executeRemoteCommand(healthCommand);

    if (!result.success || !result.output) {
      console.error("Failed to get VM health:", result.error);
      return getLocalSystemHealth();
    }

    const data = JSON.parse(result.output.trim());
    const totalMemory = Number(data.memTotal);
    const usedMemory = Number(data.memUsed);

    return {
      cpu: Number(data.cpu) || 0,
      memory: {
        total: Math.round((totalMemory / (1024 * 1024 * 1024)) * 100) / 100,
        used: Math.round((usedMemory / (1024 * 1024 * 1024)) * 100) / 100,
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      uptime: Number(data.uptime) || 0,
      platform: data.platform || "linux",
      hostname: data.hostname || "vm",
    };
  } catch (error) {
    console.error("Error getting VM health:", error);
    return getLocalSystemHealth();
  }
}

function getLocalSystemHealth(): {
  cpu: number;
  memory: {
    total: number;
    used: number;
    percentage: number;
  };
  uptime: number;
  platform: string;
  hostname: string;
} {
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce(
    (acc, cpu) =>
      acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq,
    0
  );
  const cpuUsage = Math.round((1 - totalIdle / totalTick) * 100);

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

  return {
    cpu: cpuUsage,
    memory: {
      total: Math.round((totalMemory / (1024 * 1024 * 1024)) * 100) / 100,
      used: Math.round((usedMemory / (1024 * 1024 * 1024)) * 100) / 100,
      percentage: memoryPercentage,
    },
    uptime: Math.round(os.uptime()),
    platform: os.platform(),
    hostname: os.hostname(),
  };
}
