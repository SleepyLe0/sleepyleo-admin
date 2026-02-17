"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, Clock, Server, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HealthData {
  cpu: number;
  memory: {
    total: number;
    used: number;
    percentage: number;
  };
  uptime: number;
  platform: string;
  hostname: string;
}

const THIS_IS_FINE_GIF = "https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif";
const EVERYTHING_OK_GIF = "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "< 1m";
}

export function HealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Failed to fetch health data");
      const data = await response.json();
      setHealth(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 300000); // Poll every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const isCritical = health && (health.cpu > 90 || health.memory.percentage > 90);
  const isWarning = health && (health.cpu > 70 || health.memory.percentage > 70);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Health</h2>
          {lastUpdated && (
            <p className="text-sm text-neutral-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button onClick={fetchHealth} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="bg-red-900/50 border-red-500">
          <CardContent className="p-4 flex items-center gap-2 text-red-200">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </CardContent>
        </Card>
      )}

      {isCritical && (
        <Card className="bg-red-900/30 border-red-500/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  This is Fine
                </h3>
                <p className="text-neutral-300">
                  Server resources are critically high. Everything is definitely under control.
                  Nothing to see here. Move along.
                </p>
              </div>
              <div className="relative w-full md:w-64 aspect-video">
                <Image
                  src={THIS_IS_FINE_GIF}
                  alt="This is fine"
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isCritical && !isWarning && health && (
        <Card className="bg-green-900/30 border-green-500/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  All Systems Nominal
                </h3>
                <p className="text-neutral-300">
                  Server is running smoothly. The hamsters powering this thing are well-fed.
                </p>
              </div>
              <div className="relative w-full md:w-64 aspect-video">
                <Image
                  src={EVERYTHING_OK_GIF}
                  alt="Everything is OK"
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {loading ? "..." : `${health?.cpu ?? 0}%`}
            </div>
            <Progress
              value={health?.cpu ?? 0}
              className={cn(
                "h-2",
                health?.cpu && health.cpu > 90 && "[&>div]:bg-red-500",
                health?.cpu && health.cpu > 70 && health.cpu <= 90 && "[&>div]:bg-yellow-500"
              )}
            />
            {health?.cpu && health.cpu > 90 && (
              <p className="text-xs text-red-400 mt-2">CPU is cooking!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {loading ? "..." : `${health?.memory.percentage ?? 0}%`}
            </div>
            <Progress
              value={health?.memory.percentage ?? 0}
              className={cn(
                "h-2",
                health?.memory.percentage && health.memory.percentage > 90 && "[&>div]:bg-red-500",
                health?.memory.percentage && health.memory.percentage > 70 && health.memory.percentage <= 90 && "[&>div]:bg-yellow-500"
              )}
            />
            <p className="text-xs text-neutral-500 mt-2">
              {health ? `${health.memory.used}GB / ${health.memory.total}GB` : "..."}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {loading ? "..." : formatUptime(health?.uptime ?? 0)}
            </div>
            <CardDescription className="mt-2">
              Without a crash. Probably.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white truncate">
              {loading ? "..." : health?.hostname}
            </div>
            <CardDescription className="mt-2 capitalize">
              {health?.platform ?? "..."} based
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
