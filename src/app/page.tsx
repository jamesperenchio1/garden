'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf, Droplets, Cloud, CalendarDays, AlertTriangle, CheckCircle, ImageIcon, Users, MessageSquarePlus } from 'lucide-react';
import { db } from '@/lib/db';
import { useWeather } from '@/hooks/use-weather';
import { getWeatherDescription, getWeatherIcon } from '@/lib/api/weather';
import { getOverdueTasks, getUpcomingTasks } from '@/lib/notifications';
import type { Plant } from '@/types/plant';
import type { Task } from '@/types/calendar';
import type { HydroSystem } from '@/types/system';
import Link from 'next/link';

export default function DashboardPage() {
  const { weather, loading: weatherLoading } = useWeather();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [systems, setSystems] = useState<HydroSystem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [allPlants, allSystems, upcoming, overdue] = await Promise.all([
        db.plants.toArray(),
        db.systems.toArray(),
        getUpcomingTasks(7),
        getOverdueTasks(),
      ]);
      setPlants(allPlants);
      setSystems(allSystems);
      setUpcomingTasks(upcoming);
      setOverdueTasks(overdue);
      setLoading(false);
    }
    loadData();
  }, []);

  const healthyCount = plants.filter(
    (p) => !p.healthTags?.some((t) => t.severity === 'high')
  ).length;
  const attentionCount = plants.filter(
    (p) => p.healthTags?.some((t) => t.severity === 'high')
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/plants">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '-' : plants.length}</p>
                  <p className="text-sm text-muted-foreground">Total Plants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/designer">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '-' : systems.length}</p>
                  <p className="text-sm text-muted-foreground">Systems</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : healthyCount}</p>
                <p className="text-sm text-muted-foreground">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : attentionCount}</p>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <Link href="/weather">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cloud className="h-4 w-4" />
                Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : weather ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getWeatherIcon(weather.current.weatherCode)}</span>
                    <span className="text-3xl font-bold">{Math.round(weather.current.temperature)}°C</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getWeatherDescription(weather.current.weatherCode)}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <span>Humidity: {weather.current.humidity}%</span>
                    <span>Wind: {Math.round(weather.current.windSpeed)} km/h</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to load weather</p>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : overdueTasks.length === 0 && upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming tasks. Add plants to generate tasks.
              </p>
            ) : (
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                    <span>{task.title}</span>
                  </div>
                ))}
                {upcomingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs">{task.type}</Badge>
                    <span>{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Plants */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="h-4 w-4" />
              Recent Plants
            </CardTitle>
            <CardDescription>Latest additions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : plants.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                <p>No plants yet.</p>
                <Link href="/plants/new" className="text-green-600 hover:underline">
                  Add your first plant
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {plants.slice(0, 5).map((plant) => (
                  <Link
                    key={plant.id}
                    href={`/plants/${plant.id}`}
                    className="flex items-center justify-between text-sm hover:bg-muted p-1 rounded"
                  >
                    <span className="font-medium">{plant.name}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {plant.category}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/plants/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Leaf className="h-4 w-4" />
              Add Plant
            </Link>
            <Link
              href="/weather"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              <Cloud className="h-4 w-4" />
              Check Weather
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              <CalendarDays className="h-4 w-4" />
              View Calendar
            </Link>
            <Link
              href="/designer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              <Droplets className="h-4 w-4" />
              Design System
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              <ImageIcon className="h-4 w-4" />
              Gallery
            </Link>
            <Link
              href="/companions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              Companions
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Feedback
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
