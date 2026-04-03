import { db } from '@/lib/db';
import type { Task } from '@/types/calendar';

export async function getUpcomingTasks(daysAhead: number = 3): Promise<Task[]> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);

  return db.tasks
    .where('dueDate')
    .between(now, future)
    .and((task) => !task.completed)
    .toArray();
}

export async function getOverdueTasks(): Promise<Task[]> {
  const now = new Date();
  return db.tasks
    .where('dueDate')
    .below(now)
    .and((task) => !task.completed)
    .toArray();
}

export async function completeTask(taskId: number): Promise<void> {
  await db.tasks.update(taskId, {
    completed: true,
    completedAt: new Date(),
  });
}

export async function scheduleRecurringTask(task: Task): Promise<void> {
  if (!task.recurring || !task.id) return;

  const nextDue = new Date(task.dueDate);
  const { interval, unit } = task.recurring;

  switch (unit) {
    case 'days':
      nextDue.setDate(nextDue.getDate() + interval);
      break;
    case 'weeks':
      nextDue.setDate(nextDue.getDate() + interval * 7);
      break;
    case 'months':
      nextDue.setMonth(nextDue.getMonth() + interval);
      break;
  }

  await db.tasks.add({
    ...task,
    id: undefined,
    dueDate: nextDue,
    completed: false,
    completedAt: undefined,
    createdAt: new Date(),
  });
}
