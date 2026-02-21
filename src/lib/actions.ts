"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ── Project ──────────────────────────────────────────────

export async function getProjects() {
  return prisma.project.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createProject(name: string) {
  await prisma.project.create({ data: { name } });
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
}

// ── Task ─────────────────────────────────────────────────

export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type TaskInput = {
  title: string;
  due?: string;
  priority?: Priority;
  projectId: string;
  labels?: { key: string; value: string }[];
};

export async function getTasksByProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    include: { labels: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTask(input: TaskInput) {
  const { labels = [], due, ...rest } = input;
  await prisma.task.create({
    data: {
      ...rest,
      due: due ? new Date(due) : undefined,
      labels: { create: labels },
    },
  });
  revalidatePath("/");
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput> & { completed?: boolean }
) {
  const { labels, due, ...rest } = input;
  await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      due: due !== undefined ? (due ? new Date(due) : null) : undefined,
      ...(labels !== undefined && {
        labels: {
          deleteMany: {},
          create: labels,
        },
      }),
    },
  });
  revalidatePath("/");
}

export async function toggleTask(id: string, completed: boolean) {
  await prisma.task.update({ where: { id }, data: { completed } });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

// ── Seed inbox ────────────────────────────────────────────

export async function ensureInbox() {
  const inbox = await prisma.project.findFirst({ where: { name: "inbox" } });
  if (!inbox) {
    await prisma.project.create({ data: { name: "inbox" } });
  }
}
