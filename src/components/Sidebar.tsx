"use client";

import { useState } from "react";
import { createProject, deleteProject } from "@/lib/actions";

type Project = { id: string; name: string };

type Props = {
  projects: Project[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function Sidebar({ projects, selectedId, onSelect }: Props) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createProject(newName.trim());
    setNewName("");
    setAdding(false);
  };

  return (
    <aside className="w-56 shrink-0 bg-gray-50 border-r min-h-screen p-3 flex flex-col gap-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Projects
      </p>
      {projects.map((p) => (
        <div
          key={p.id}
          className={`flex items-center justify-between rounded px-2 py-1 cursor-pointer group ${
            p.id === selectedId ? "bg-blue-600 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => onSelect(p.id)}
        >
          <span className="text-sm truncate">{p.name}</span>
          {p.name !== "inbox" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteProject(p.id);
              }}
              className={`text-xs opacity-0 group-hover:opacity-100 ${
                p.id === selectedId ? "text-blue-200 hover:text-white" : "text-gray-400 hover:text-red-500"
              }`}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleCreate} className="mt-1">
          <input
            autoFocus
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="プロジェクト名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => !newName && setAdding(false)}
          />
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-1 text-sm text-gray-400 hover:text-gray-700 text-left px-2 py-1"
        >
          + プロジェクト追加
        </button>
      )}
    </aside>
  );
}
