import { CalendarDays } from "lucide-react";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { events, getClient } from "@/lib/data";

export default function CalendarPage() {
  const grouped = events.reduce<Record<string, typeof events>>((acc, event) => {
    acc[event.date] = [...(acc[event.date] ?? []), event];
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="יומן" description="תצוגה פשוטה של הסדנאות הקרובות לפי ימים, לפני שנכנסים לתכנון עמוק יותר." />
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, dayEvents]) => (
          <Card key={date}>
            <div className="mb-4 flex items-center gap-3">
              <CalendarDays className="text-coral" />
              <h2 className="text-2xl font-black text-ink">{date}</h2>
            </div>
            <div className="grid gap-3">
              {dayEvents.map((event) => (
                <div key={event.id} className="flex flex-col gap-3 rounded-3xl bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xl font-black text-ink">
                      {event.time} · {event.title}
                    </p>
                    <p className="font-bold text-clay">
                      {getClient(event.clientId)?.name} · {event.city}
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
