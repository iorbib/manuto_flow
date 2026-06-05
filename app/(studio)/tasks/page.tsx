"use client";

import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import { Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { useStudioData } from "@/lib/storage";

const taskIcons = {
  open: Circle,
  doing: LoaderCircle,
  done: CheckCircle2
};

const taskLabels = {
  open: "פתוח",
  doing: "בעבודה",
  done: "הושלם"
};

export default function TasksPage() {
  const { data } = useStudioData();

  return (
    <>
      <PageHeader title="סטודיו" description="משימות הסטודיו מתוך האירועים והדאטה השמור." />
      {data.studioTasks.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.studioTasks.map((task) => {
            const event = data.events.find((item) => item.id === task.eventId);
            const Icon = taskIcons[task.status];
            return (
              <Card key={task.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-ink">{task.title}</h2>
                    <p className="mt-1 font-bold text-clay">{event?.title || "אירוע שנמחק"}</p>
                  </div>
                  <Icon className="text-coral" />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-peach/60 px-4 py-2 font-black text-ink">{taskLabels[task.status]}</span>
                  <span className="font-bold text-clay">עד {task.dueDate}</span>
                  {event ? <StatusBadge status={event.status} /> : null}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="אין משימות סטודיו" body="כשאירועים יעברו לטיפול סטודיו, המשימות יופיעו כאן." />
      )}
    </>
  );
}
