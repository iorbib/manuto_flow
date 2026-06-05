"use client";

import { CalendarDays } from "lucide-react";
import { Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { useStudioData } from "@/lib/storage";

export default function CalendarPage() {
  const { data } = useStudioData();
  const grouped = data.events.reduce<Record<string, typeof data.events>>((acc, event) => {
    acc[event.date] = [...(acc[event.date] ?? []), event];
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="יומן" description="תצוגת ימים מתוך האירועים ששמורים כרגע במערכת." />
      {Object.entries(grouped).length ? (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayEvents]) => (
            <Card key={date}>
              <div className="mb-4 flex items-center gap-3">
                <CalendarDays className="text-coral" />
                <h2 className="text-2xl font-black text-ink">{date}</h2>
              </div>
              <div className="grid gap-3">
                {dayEvents.map((event) => {
                  const client = data.clients.find((item) => item.id === event.clientId);
                  return (
                    <div key={event.id} className="flex flex-col gap-3 rounded-3xl bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xl font-black text-ink">
                          {event.startTime} · {event.title}
                        </p>
                        <p className="font-bold text-clay">
                          {client?.name || "ללא לקוח"} · {event.address || "ללא כתובת"}
                        </p>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="אין אירועים ביומן" body="ברגע שתוסיפי אירוע הוא יופיע כאן לפי תאריך." />
      )}
    </>
  );
}
