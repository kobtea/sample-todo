import { prisma } from "@/lib/prisma";
import { ensureInbox } from "@/lib/actions";
import TodoApp from "@/components/TodoApp";

export default async function Home() {
  await ensureInbox();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      tasks: {
        include: { labels: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return <TodoApp projects={projects} />;
}
