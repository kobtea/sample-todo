"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ── バリデーション定数 ────────────────────────────────────

const VALID_PRIORITIES = ["NONE", "LOW", "MEDIUM", "HIGH"] as const;
const MAX_TITLE_LENGTH = 500;
const MAX_NAME_LENGTH = 100;
const MAX_LABEL_KEY_LENGTH = 100;
const MAX_LABEL_VALUE_LENGTH = 500;

function assertString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} は必須です`);
  }
  if (value.trim().length > maxLength) {
    throw new Error(`${name} は${maxLength}文字以内にしてください`);
  }
  return value.trim();
}

// ── Project ──────────────────────────────────────────────

export async function getProjects() {
  return prisma.project.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createProject(name: string) {
  const validName = assertString(name, "プロジェクト名", MAX_NAME_LENGTH);
  await prisma.project.create({ data: { name: validName } });
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  assertString(id, "id", 100);
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
}

// ── Task ─────────────────────────────────────────────────

export type Priority = (typeof VALID_PRIORITIES)[number];

export type TaskInput = {
  title: string;
  due?: string;
  priority?: Priority;
  projectId: string;
  labels?: { key: string; value: string }[];
};

function validateTaskInput(input: TaskInput) {
  const title = assertString(input.title, "タイトル", MAX_TITLE_LENGTH);
  assertString(input.projectId, "projectId", 100);

  const priority: Priority =
    input.priority && (VALID_PRIORITIES as readonly string[]).includes(input.priority)
      ? input.priority
      : "NONE";

  let due: Date | undefined;
  if (input.due) {
    due = new Date(input.due);
    if (isNaN(due.getTime())) throw new Error("日付の形式が不正です");
  }

  const labels = (input.labels ?? []).map((l) => ({
    key: assertString(l.key, "ラベルキー", MAX_LABEL_KEY_LENGTH),
    value: assertString(l.value, "ラベル値", MAX_LABEL_VALUE_LENGTH),
  }));

  return { title, priority, due, projectId: input.projectId, labels };
}

export async function getTasksByProject(projectId: string) {
  assertString(projectId, "projectId", 100);
  return prisma.task.findMany({
    where: { projectId },
    include: { labels: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTask(input: TaskInput) {
  const { labels, due, ...rest } = validateTaskInput(input);
  await prisma.task.create({
    data: {
      ...rest,
      due: due ?? undefined,
      labels: { create: labels },
    },
  });
  revalidatePath("/");
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput> & { completed?: boolean }
) {
  assertString(id, "id", 100);
  const { labels, due, ...rest } = validateTaskInput({
    title: input.title ?? " ",
    projectId: input.projectId ?? "placeholder",
    priority: input.priority,
    due: input.due,
    labels: input.labels,
  });

  await prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: rest.title }),
      ...(input.priority !== undefined && { priority: rest.priority }),
      ...(input.completed !== undefined && { completed: input.completed }),
      due: input.due !== undefined ? (due ?? null) : undefined,
      ...(input.labels !== undefined && {
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
  assertString(id, "id", 100);
  if (typeof completed !== "boolean") throw new Error("completed は boolean である必要があります");
  await prisma.task.update({ where: { id }, data: { completed } });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  assertString(id, "id", 100);
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

// ── Seed inbox ────────────────────────────────────────────

export async function ensureInbox() {
  // トランザクションで競合状態を防ぐ
  await prisma.$transaction(async (tx) => {
    const inbox = await tx.project.findFirst({ where: { name: "inbox" } });
    if (!inbox) {
      await tx.project.create({ data: { name: "inbox" } });
    }
  });
}
