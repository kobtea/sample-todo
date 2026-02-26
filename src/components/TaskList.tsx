"use client";

import { useState } from "react";
import TaskItem from "./TaskItem";
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

type Props = {
  projectId: string;
  projectName: string;
  tasks: Task[];
};

export default function TaskList({ projectId, projectName, tasks }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  return (
    <div className="flex-1 p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{projectName}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + タスク追加
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2 py-1 rounded ${
              filter === f ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了"}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-3">
          <TaskForm projectId={projectId} onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">タスクがありません</p>
        ) : (
          filtered.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
