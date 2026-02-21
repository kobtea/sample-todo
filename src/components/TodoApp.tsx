"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TaskList from "./TaskList";

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
type Project = { id: string; name: string; tasks: Task[] };

export default function TodoApp({ projects }: { projects: Project[] }) {
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? "");

  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar
        projects={projects}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selected && (
        <TaskList
          projectId={selected.id}
          projectName={selected.name}
          tasks={selected.tasks}
        />
      )}
    </div>
  );
}
