"use client";

import { useState } from "react";
import { toggleTask, deleteTask } from "@/lib/actions";
import TaskForm from "./TaskForm";

type Label = { id: string; key: string; value: string };
type Task = {
  id: string;
  title: string;
  due: Date | null;
  priority: string;
  completed: boolean;
  projectId: string;
  labels: Label[];
};

const PRIORITY_COLOR: Record<string, string> = {
  NONE: "text-gray-400",
  LOW: "text-green-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-red-500",
};

export default function TaskItem({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <TaskForm
        projectId={task.projectId}
        onClose={() => setEditing(false)}
        initial={{
          id: task.id,
          title: task.title,
          due: task.due,
          priority: task.priority,
          labels: task.labels.map(({ key, value }) => ({ key, value })),
        }}
      />
    );
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 ${task.completed ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => toggleTask(task.id, e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${task.completed ? "line-through" : ""}`}>
            {task.title}
          </span>
          <span className={`text-xs font-bold ${PRIORITY_COLOR[task.priority]}`}>
            {task.priority !== "NONE" && task.priority}
          </span>
        </div>
        {task.due && (
          <p className="text-xs text-gray-500 mt-0.5">
            期日: {new Date(task.due).toLocaleDateString("ja-JP")}
          </p>
        )}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {task.labels.map((l) => (
              <span
                key={l.id}
                className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded"
              >
                {l.key}: {l.value}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-blue-600 px-1"
        >
          編集
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-xs text-gray-400 hover:text-red-600 px-1"
        >
          削除
        </button>
      </div>
    </div>
  );
}
