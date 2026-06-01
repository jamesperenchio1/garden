"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlants } from "@/hooks/use-plants";
import { useWeather } from "@/hooks/use-weather";
import { useAppStore } from "@/store/app-store";
import { getUpcomingTasks } from "@/lib/notifications";
import { getMoonPhase, getMoonPhaseEmoji, getMoonPhaseName } from "@/lib/api/moon";
import { evaluateThaiHazards } from "@/data/thai-hazards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  CloudSun,
  CalendarDays,
  Moon,
  ArrowRight,
  Plus,
  ClipboardList,
  AlertTriangle,
  Wind,
  Droplets,
} from "lucide-react";
import type { Task, PlantCategory } from "@/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, gardener";
  if (hour < 17) return "Good afternoon, gardener";
  return "Good evening, gardener";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "🌤️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 55) return "🌧️";
  if (code >= 56 && code <= 57) return "🌧️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "🌡️";
}

function weatherCodeToCondition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

const CATEGORY_ORDER: PlantCategory[] = ["vegetable", "herb", "fruit", "flower"];

export default function DashboardPage() {
  const router = useRouter();
  const { plants, loading: plantsLoading } = usePlants();
  const { weather, loading: weatherLoading } = useWeather();
  const thaiHazardsEnabled = useAppStore((s) => s.thaiHazardsEnabled);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUpcomingTasks(7).then((t) => {
      if (!cancelled) {
        setTasks(t);
        setTasksLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const moon = useMemo(() => getMoonPhase(), []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of plants) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [plants]);

  const thaiHazards = useMemo(() => {
    if (!thaiHazardsEnabled || !weather) return [];
    return evaluateThaiHazards(
      new Date(),
      weather.current.temperature,
      weather.current.precipitation,
      weather.current.humidity,
      weather.current.windSpeed
    );
  }, [thaiHazardsEnabled, weather]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Welcome */}
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{getGreeting()}</h1>
        <p className="text-muted-foreground">{formatDate(new Date())}</p>
      </section>

      {/* Quick Actions */}
      <section className="mb-6 flex flex-wrap gap-3">
        <Button onClick={() => router.push("/plants/new")}>
          <Plus className="size-4" />
          Add Plant
        </Button>
        <Button variant="outline" onClick={() => router.push("/tasks/new")}>
          <ClipboardList className="size-4" />
          Add Task
        </Button>
        <Button variant="outline" onClick={() => router.push("/calendar")}>
          <CalendarDays className="size-4" />
          View Calendar
        </Button>
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Weather Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="size-4 text-primary" />
              Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherLoading || !weather ? (
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{weatherCodeToEmoji(weather.current.weatherCode)}</span>
                  <div>
                    <p className="text-lg font-medium">{Math.round(weather.current.temperature)}°C</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherCodeToCondition(weather.current.weatherCode)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Droplets className="size-3.5" />
                    <span>{weather.current.humidity}% humidity</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Wind className="size-3.5" />
                    <span>{Math.round(weather.current.windSpeed)} km/h</span>
                  </div>
                </div>
                <Link
                  href="/weather"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Full forecast <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plants Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="size-4 text-primary" />
              Plants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plantsLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg font-medium">
                  {plants.length} {plants.length === 1 ? "plant" : "plants"} total
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ORDER.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    if (count === 0) return null;
                    return (
                      <Badge key={cat} variant="secondary">
                        {count} {cat}
                        {count !== 1 ? "s" : ""}
                      </Badge>
                    );
                  })}
                  {plants.length === 0 && (
                    <p className="text-sm text-muted-foreground">No plants yet.</p>
                  )}
                </div>
                <Link
                  href="/plants"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View all plants <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Moon Phase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="size-4 text-primary" />
              Moon Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getMoonPhaseEmoji(moon.phase)}</span>
                <div>
                  <p className="font-medium">{getMoonPhaseName(moon.phase)}</p>
                  <p className="text-sm text-muted-foreground">
                    {moon.illumination}% illumination
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {moon.plantingAdvice}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4 text-primary" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks due in the next 7 days. You&apos;re all caught up!
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View all tasks <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thai Hazards */}
        {thaiHazardsEnabled && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4" />
                Active Hazards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {thaiHazards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active hazards right now.</p>
              ) : (
                <div className="space-y-2">
                  {thaiHazards.slice(0, 4).map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-destructive/10 bg-destructive/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block size-2 rounded-full ${
                            h.severity === "extreme" || h.severity === "high"
                              ? "bg-destructive"
                              : "bg-amber-500"
                          }`}
                        />
                        <p className="text-sm font-medium">{h.title}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{h.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
