import { db } from "@/lib/db";
import type { Task } from "@/types";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function computeNextDueDate(baseDate: Date, recurring: Task["recurring"]): Date {
  if (!recurring) return baseDate;
  switch (recurring.unit) {
    case "days":
      return addDays(baseDate, recurring.interval);
    case "weeks":
      return addWeeks(baseDate, recurring.interval);
    case "months":
      return addMonths(baseDate, recurring.interval);
    default:
      return baseDate;
  }
}

export async function getUpcomingTasks(days: number = 7): Promise<Task[]> {
  const now = startOfDay(new Date());
  const end = addDays(now, days);

  const tasks = await db.tasks
    .where("completed")
    .equals(0)
    .and((t) => {
      const due = startOfDay(t.dueDate);
      return due >= now && due <= end;
    })
    .sortBy("dueDate");

  return tasks;
}

export async function getOverdueTasks(): Promise<Task[]> {
  const now = startOfDay(new Date());

  const tasks = await db.tasks
    .where("completed")
    .equals(0)
    .and((t) => startOfDay(t.dueDate) < now)
    .sortBy("dueDate");

  return tasks;
}

export async function completeTask(taskId: number): Promise<void> {
  const task = await db.tasks.get(taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  const now = new Date();

  await db.tasks.update(taskId, {
    completed: true,
    completedAt: now,
  });

  // Auto-schedule recurring tasks
  if (task.recurring) {
    const nextDue = computeNextDueDate(now, task.recurring);
    const newTask: Task = {
      plantId: task.plantId,
      type: task.type,
      title: task.title,
      description: task.description,
      dueDate: nextDue,
      completed: false,
      recurring: task.recurring,
      createdAt: now,
    };
    await db.tasks.add(newTask);
  }
}
