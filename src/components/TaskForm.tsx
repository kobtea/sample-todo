"use client";

import { useState } from "react";
import { createTask, updateTask, type Priority, type TaskInput } from "@/lib/actions";

type Label = { key: string; value: string };

type Props = {
  projectId: string;
  onClose: () => void;
  initial?: {
    id: string;
    title: string;
    due: Date | null;
    priority: string;
    labels: Label[];
  };
};

const PRIORITIES: Priority[] = ["NONE", "LOW", "MEDIUM", "HIGH"];

export default function TaskForm({ projectId, onClose, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [due, setDue] = useState(
    initial?.due ? initial.due.toISOString().slice(0, 10) : ""
  );
  const [priority, setPriority] = useState<Priority>(
    (initial?.priority as Priority) ?? "NONE"
  );
  const [labels, setLabels] = useState<Label[]>(initial?.labels ?? []);
  const [labelKey, setLabelKey] = useState("");
  const [labelValue, setLabelValue] = useState("");

  const addLabel = () => {
    if (!labelKey.trim()) return;
    setLabels((prev) => [...prev, { key: labelKey.trim(), value: labelValue.trim() }]);
    setLabelKey("");
    setLabelValue("");
  };

  const removeLabel = (i: number) => {
    setLabels((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const input: TaskInput = {
      title: title.trim(),
      due: due || undefined,
      priority,
      projectId,
      labels,
    };
    if (initial) {
      await updateTask(initial.id, input);
    } else {
      await createTask(input);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white border rounded-lg shadow">
      <div>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500">期日</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1 text-sm"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500">優先度</label>
          <select
            className="w-full border rounded px-2 py-1 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">ラベル</label>
        <div className="flex gap-1 mt-1">
          <input
            className="border rounded px-2 py-1 text-sm flex-1"
            placeholder="キー"
            value={labelKey}
            onChange={(e) => setLabelKey(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 text-sm flex-1"
            placeholder="値"
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
          />
          <button
            type="button"
            onClick={addLabel}
            className="px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {labels.map((l, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded"
            >
              {l.key}: {l.value}
              <button type="button" onClick={() => removeLabel(i)} className="hover:text-red-500">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {initial ? "更新" : "作成"}
        </button>
      </div>
    </form>
  );
}
