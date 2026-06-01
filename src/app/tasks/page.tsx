"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { getUpcomingTasks, getOverdueTasks, completeTask } from "@/lib/notifications";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Droplets,
  Leaf,
  Scissors,
  Package,
  Bug,
  Repeat,
  Sprout,
  Calendar,
} from "lucide-react";

const taskTypeMeta: Record<
  Task["type"],
  { label: string; icon: React.ReactNode; color: string }
> = {
  water: { label: "Water", icon: <Droplets className="size-4" />, color: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200" },
  fertilize: { label: "Fertilize", icon: <Leaf className="size-4" />, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  prune: { label: "Prune", icon: <Scissors className="size-4" />, color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  harvest: { label: "Harvest", icon: <Package className="size-4" />, color: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200" },
  pest_control: { label: "Pest Control", icon: <Bug className="size-4" />, color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200" },
  custom: { label: "Custom", icon: <Sprout className="size-4" />, color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
};

type TabKey = "upcoming" | "overdue" | "completed";

export default function TasksPage() {
  const [upcoming, setUpcoming] = useState<Task[]>([]);
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);
  const [tab, setTab] = useState<TabKey>("upcoming");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<Task["type"]>("water");
  const [plantId, setPlantId] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [interval, setInterval] = useState("1");
  const [unit, setUnit] = useState<NonNullable<Task["recurring"]>["unit"]>("days");

  async function load() {
    setLoading(true);
    const [u, o, c] = await Promise.all([
      getUpcomingTasks(7),
      getOverdueTasks(),
      db.tasks.where("completed").equals(1).reverse().limit(50).toArray(),
    ]);
    setUpcoming(u);
    setOverdue(o);
    setCompleted(c);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleComplete(task: Task) {
    if (!task.id) return;
    await completeTask(task.id);
    await load();
  }

  async function handleAddTask() {
    if (!title.trim() || !dueDate) return;
    const task: Task = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate),
      type,
      completed: false,
      plantId: plantId ? Number(plantId) : undefined,
      recurring: recurring
        ? { interval: Number(interval) || 1, unit }
        : undefined,
      createdAt: new Date(),
    };
    await db.tasks.add(task);
    setTitle("");
    setDescription("");
    setDueDate("");
    setPlantId("");
    setRecurring(false);
    setInterval("1");
    setUnit("days");
    setAddOpen(false);
    await load();
  }

  function formatDate(d: Date) {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  function isOverdue(task: Task) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < now;
  }

  function renderTasks(tasks: Task[], tabKey: TabKey) {
    if (tasks.length === 0) {
      return (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Calendar className="mx-auto mb-2 size-8 opacity-50" />
          {tabKey === "upcoming" && "No upcoming tasks."}
          {tabKey === "overdue" && "No overdue tasks — great job!"}
          {tabKey === "completed" && "No completed tasks yet."}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {tasks.map((task) => {
          const meta = taskTypeMeta[task.type];
          const overdue = isOverdue(task);
          return (
            <Card
              key={task.id}
              className={cn(
                "transition-shadow",
                overdue && "border-destructive/30"
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                {tabKey !== "completed" && (
                  <Checkbox
                    className="mt-1"
                    checked={false}
                    onCheckedChange={() => handleComplete(task)}
                  />
                )}
                {tabKey === "completed" && (
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-500" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px]", meta.color)}
                    >
                      {meta.icon}
                      <span className="ml-1">{meta.label}</span>
                    </Badge>
                    {task.recurring && (
                      <Badge variant="outline" className="text-[10px]">
                        <Repeat className="mr-1 size-3" />
                        Every {task.recurring.interval} {task.recurring?.unit}
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {overdue ? (
                        <AlertTriangle className="size-3 text-destructive" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                      <span className={cn(overdue && "text-destructive font-medium")}>
                        {formatDate(task.dueDate)}
                        {overdue && " (overdue)"}
                      </span>
                    </span>
                    {task.plantId && (
                      <span className="flex items-center gap-1">
                        <Sprout className="size-3" />
                        Plant #{task.plantId}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Task Manager</h1>
          <p className="text-sm text-muted-foreground">
            Stay on top of garden care
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Plus className="mr-1 size-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Task</DialogTitle>
              <DialogDescription>
                Schedule a gardening task
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="t-title">Title</Label>
                <Input
                  id="t-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water tomatoes"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="t-desc">Description</Label>
                <Textarea
                  id="t-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="t-due">Due date</Label>
                  <Input
                    id="t-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="t-type">Type</Label>
                  <select
                    id="t-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as Task["type"])}
                    className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="water">Water</option>
                    <option value="fertilize">Fertilize</option>
                    <option value="prune">Prune</option>
                    <option value="harvest">Harvest</option>
                    <option value="pest_control">Pest Control</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="t-plant">Linked plant ID (optional)</Label>
                <Input
                  id="t-plant"
                  type="number"
                  value={plantId}
                  onChange={(e) => setPlantId(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="t-recurring"
                  checked={recurring}
                  onCheckedChange={(v) => setRecurring(!!v)}
                />
                <Label htmlFor="t-recurring" className="text-sm font-normal">
                  Recurring task
                </Label>
              </div>
              {recurring && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="t-int">Interval</Label>
                    <Input
                      id="t-int"
                      type="number"
                      min={1}
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="t-unit">Unit</Label>
                    <select
                      id="t-unit"
                      value={unit}
                      onChange={(e) =>
                        setUnit(e.target.value as NonNullable<Task["recurring"]>["unit"])
                      }
                      className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcoming.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {overdue.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px]">
                {overdue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {renderTasks(upcoming, "upcoming")}
        </TabsContent>
        <TabsContent value="overdue">
          {renderTasks(overdue, "overdue")}
        </TabsContent>
        <TabsContent value="completed">
          {renderTasks(completed, "completed")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
