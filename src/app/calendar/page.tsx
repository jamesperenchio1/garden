'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar } from '@/components/ui/calendar';
import { thaiPlantingCalendar, getPlantingWindowsForMonth, getActivityForPlant } from '@/data/thai-plants';
import { getMoonPhase, getMoonPhaseEmoji, getMoonPhaseName } from '@/lib/api/moon';
import { db } from '@/lib/db';
import { getUpcomingTasks, getOverdueTasks, completeTask } from '@/lib/notifications';
import { format, formatDistanceToNow } from 'date-fns';
import type { Task } from '@/types/calendar';
import type { Plant } from '@/types/plant';
import { syncGeneratedTasks, computeNextStep, moonSuggestion, type NextStep } from '@/lib/tasks/generator';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, ArrowRight, Leaf } from 'lucide-react';
import Link from 'next/link';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const categoryColors: Record<string, string> = {
  vegetable: 'bg-green-100 text-green-800',
  herb: 'bg-emerald-100 text-emerald-800',
  fruit: 'bg-orange-100 text-orange-800',
  flower: 'bg-pink-100 text-pink-800',
  ornamental: 'bg-purple-100 text-purple-800',
  medicinal: 'bg-blue-100 text-blue-800',
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);
  const [moonBias, setMoonBias] = useState<ReturnType<typeof moonSuggestion> | null>(null);

  const refreshTasks = async () => {
    // Generate any missing tasks from plants first, then read them back.
    await syncGeneratedTasks();
    const [upcoming, overdueT, allPlants] = await Promise.all([
      getUpcomingTasks(30),
      getOverdueTasks(),
      db.plants.toArray(),
    ]);
    setTasks(upcoming);
    setOverdue(overdueT);
    setPlants(allPlants);
    setNextSteps(
      allPlants
        .map((p) => computeNextStep(p))
        .filter((s): s is NextStep => s !== null)
        .sort((a, b) => {
          const order = { soon: 0, upcoming: 1, later: 2 };
          return order[a.priority] - order[b.priority];
        })
    );
  };

  useEffect(() => {
    refreshTasks();
    setMoonBias(moonSuggestion(new Date()));
  }, []);

  useEffect(() => {
    setMoonBias(moonSuggestion(selectedDate));
  }, [selectedDate]);

  const handleCompleteTask = async (taskId: number) => {
    await completeTask(taskId);
    await refreshTasks();
  };

  const handleAddNextStepAsTask = async (step: NextStep) => {
    const due = new Date();
    due.setDate(due.getDate() + 1);
    await db.tasks.add({
      plantId: step.plantId,
      type: 'custom',
      title: `${step.action}: ${step.plantName}`,
      description: step.detail,
      dueDate: due,
      completed: false,
      createdAt: new Date(),
    });
    await refreshTasks();
  };

  const plantingWindows = getPlantingWindowsForMonth(selectedMonth).filter(
    (p) => categoryFilter === 'all' || p.plantCategory === categoryFilter
  );

  const moonPhase = getMoonPhase(selectedDate);

  // Group planting windows by activity
  const sowingNow = plantingWindows.filter((p) => {
    const activities = getActivityForPlant(p, selectedMonth);
    return activities.includes('Sow outdoors') || activities.includes('Sow indoors');
  });
  const transplantingNow = plantingWindows.filter((p) =>
    getActivityForPlant(p, selectedMonth).includes('Transplant')
  );
  const harvestingNow = plantingWindows.filter((p) =>
    getActivityForPlant(p, selectedMonth).includes('Harvest')
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">My Tasks</TabsTrigger>
          <TabsTrigger value="reference">Planting Guide</TabsTrigger>
          <TabsTrigger value="moon">Moon Calendar</TabsTrigger>
        </TabsList>

        {/* Personal Tasks */}
        <TabsContent value="personal" className="mt-4">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            <Card>
              <CardContent className="pt-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {overdue.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-destructive">Overdue Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {overdue.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 rounded-lg border border-destructive/20 bg-destructive/5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{task.title.replace(/\s*\[#[^\]]+\]/g, '')}</p>
                            <p className="text-xs text-muted-foreground">Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs capitalize">{task.type}</Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Mark done"
                            onClick={() => task.id && handleCompleteTask(task.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* What next — actionable suggestions per plant */}
              {nextSteps.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      What next?
                    </CardTitle>
                    <CardDescription>
                      Suggested next actions for your plants. Click the arrow to schedule it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {nextSteps.slice(0, 5).map((step) => (
                        <div
                          key={`${step.plantId}-${step.action}`}
                          className={`flex items-start justify-between gap-2 p-2 rounded-lg border ${
                            step.priority === 'soon'
                              ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                              : step.priority === 'upcoming'
                                ? 'border-sky-200 bg-sky-50 dark:bg-sky-900/20'
                                : 'border-border'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {step.plantName} — {step.action}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.detail}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 flex-shrink-0"
                            title="Schedule this"
                            onClick={() => handleAddNextStepAsTask(step)}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Upcoming Tasks</CardTitle>
                  <CardDescription>Next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    plants.length === 0 ? (
                      <div className="text-center py-6 space-y-3">
                        <Leaf className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No plants yet. Tasks appear automatically once you add your first.
                        </p>
                        <Link href="/plants/new">
                          <Button variant="outline" size="sm">
                            Add your first plant
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No upcoming tasks in the next 30 days.
                      </p>
                    )
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg border hover:bg-muted"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {task.title.replace(/\s*\[#[^\]]+\]/g, '')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(task.dueDate), 'PPP')}
                              {task.description ? ` — ${task.description}` : ''}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">{task.type.replace('_', ' ')}</Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Mark done"
                            onClick={() => task.id && handleCompleteTask(task.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personalized plant reminders */}
              {plants.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Your Plants</CardTitle>
                    <CardDescription>Based on your plant log</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plants.slice(0, 10).map((plant) => {
                        const age = plant.plantedDate ? Math.floor((Date.now() - new Date(plant.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
                        return (
                          <div key={plant.id} className="flex items-center justify-between p-2 rounded-lg border">
                            <div>
                              <p className="text-sm font-medium">{plant.name}</p>
                              <p className="text-xs text-muted-foreground">{age !== null ? `${age} days old` : 'In plant bank'}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs capitalize">{plant.category}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Reference Planting Guide */}
        <TabsContent value="reference" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Select value={String(selectedMonth)} onValueChange={(v) => v && setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((name, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vegetable">Vegetable</SelectItem>
                <SelectItem value="herb">Herb</SelectItem>
                <SelectItem value="fruit">Fruit</SelectItem>
                <SelectItem value="flower">Flower</SelectItem>
                <SelectItem value="medicinal">Medicinal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Sowing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-green-700">Sow Now</CardTitle>
                <CardDescription>{sowingNow.length} plants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sowingNow.map((plant) => (
                    <Accordion key={plant.plantName}>
                      <AccordionItem value={plant.plantName}>
                        <AccordionTrigger className="py-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${categoryColors[plant.plantCategory] || ''}`}>
                              {plant.plantCategory}
                            </Badge>
                            <span className="text-sm">{plant.plantName}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{plant.notes}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {getActivityForPlant(plant, selectedMonth).map((act) => (
                              <Badge key={act} variant="outline" className="text-xs">{act}</Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  {sowingNow.length === 0 && <p className="text-sm text-muted-foreground">Nothing to sow this month</p>}
                </div>
              </CardContent>
            </Card>

            {/* Transplanting */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-700">Transplant</CardTitle>
                <CardDescription>{transplantingNow.length} plants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transplantingNow.map((plant) => (
                    <Accordion key={plant.plantName}>
                      <AccordionItem value={plant.plantName}>
                        <AccordionTrigger className="py-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${categoryColors[plant.plantCategory] || ''}`}>
                              {plant.plantCategory}
                            </Badge>
                            <span className="text-sm">{plant.plantName}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{plant.notes}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  {transplantingNow.length === 0 && <p className="text-sm text-muted-foreground">Nothing to transplant this month</p>}
                </div>
              </CardContent>
            </Card>

            {/* Harvesting */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-orange-700">Harvest</CardTitle>
                <CardDescription>{harvestingNow.length} plants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {harvestingNow.map((plant) => (
                    <Accordion key={plant.plantName}>
                      <AccordionItem value={plant.plantName}>
                        <AccordionTrigger className="py-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${categoryColors[plant.plantCategory] || ''}`}>
                              {plant.plantCategory}
                            </Badge>
                            <span className="text-sm">{plant.plantName}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{plant.notes}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  {harvestingNow.length === 0 && <p className="text-sm text-muted-foreground">Nothing to harvest this month</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Moon Calendar */}
        <TabsContent value="moon" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Moon Phase Calendar</CardTitle>
              <CardDescription>Biodynamic planting guide based on lunar cycles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-6xl">{getMoonPhaseEmoji(moonPhase.phase)}</span>
                <p className="text-xl font-semibold mt-2">{getMoonPhaseName(moonPhase.phase)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(selectedDate, 'PPP')} — {moonPhase.illumination}% illuminated
                </p>
                <p className="text-sm mt-3 p-3 bg-muted rounded-lg max-w-md mx-auto">{moonPhase.plantingAdvice}</p>
                {moonBias && (
                  <div className="mt-3 max-w-md mx-auto p-3 rounded-lg border bg-amber-50 dark:bg-amber-900/20 text-left">
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" /> Best for today
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{moonBias.text}</p>
                    {moonBias.favours !== 'rest' && plants.length > 0 && (
                      <p className="text-xs mt-2">
                        Plants in your garden matching this phase:{' '}
                        <span className="font-medium">
                          {plants
                            .filter((p) => {
                              if (moonBias.favours === 'leaf')
                                return p.category === 'herb' || p.name.toLowerCase().includes('lettuce') || p.name.toLowerCase().includes('spinach') || p.name.toLowerCase().includes('kale');
                              if (moonBias.favours === 'fruit')
                                return p.category === 'fruit' || p.name.toLowerCase().includes('tomato') || p.name.toLowerCase().includes('pepper');
                              if (moonBias.favours === 'root')
                                return p.name.toLowerCase().includes('carrot') || p.name.toLowerCase().includes('radish') || p.name.toLowerCase().includes('potato') || p.name.toLowerCase().includes('ginger');
                              return false;
                            })
                            .map((p) => p.name)
                            .slice(0, 5)
                            .join(', ') || 'none'}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
                  if (date.getMonth() !== selectedDate.getMonth()) return null;
                  const phase = getMoonPhase(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={i}
                      className={`text-center p-2 rounded-lg cursor-pointer hover:bg-muted ${isToday ? 'ring-2 ring-green-500' : ''}`}
                      title={`${getMoonPhaseName(phase.phase)}: ${phase.plantingAdvice}`}
                    >
                      <p className="text-xs">{i + 1}</p>
                      <p className="text-lg">{getMoonPhaseEmoji(phase.phase)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
