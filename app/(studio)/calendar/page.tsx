"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { useStudioData } from "@/lib/storage";
import type { Event } from "@/lib/types";

type CalendarView = "month" | "week" | "day";

const viewLabels: Record<CalendarView, string> = {
  month: "חודש",
  week: "שבוע",
  day: "יום"
};

const weekDays = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

export default function CalendarPage() {
  const { data } = useStudioData();
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => getInitialCursor(data.events));

  const visibleDays = useMemo(() => getVisibleDays(cursor, view), [cursor, view]);
  const title = getCalendarTitle(cursor, view);

  function move(direction: -1 | 1) {
    setCursor((current) => moveCursor(current, view, direction));
  }

  return (
    <>
      <PageHeader title="יומן" description="מבט חודשי, שבועי או יומי על הסדנאות והאירועים." />

      <Card className="mb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral text-white">
              <CalendarDays size={20} />
            </span>
            <div>
              <p className="text-sm font-black text-clay">תצוגה</p>
              <h2 className="text-2xl font-black text-ink">{title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-full bg-white/70 p-3 text-clay transition hover:text-ink" onClick={() => move(-1)} aria-label="אחורה">
              <ChevronRight size={20} />
            </button>
            <button type="button" className="rounded-full bg-white/70 px-4 py-3 text-sm font-black text-clay transition hover:text-ink" onClick={() => setCursor(new Date())}>
              היום
            </button>
            <button type="button" className="rounded-full bg-white/70 p-3 text-clay transition hover:text-ink" onClick={() => move(1)} aria-label="קדימה">
              <ChevronLeft size={20} />
            </button>
            <div className="flex rounded-full bg-white/70 p-1">
              {(Object.keys(viewLabels) as CalendarView[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${view === item ? "bg-coral text-white shadow-soft" : "text-clay hover:text-ink"}`}
                >
                  {viewLabels[item]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {data.events.length ? (
        view === "month" ? (
          <MonthView days={visibleDays} events={data.events} clients={data.clients} cursor={cursor} />
        ) : (
          <div className={view === "week" ? "grid gap-4 lg:grid-cols-7" : "space-y-4"}>
            {visibleDays.map((day) => (
              <DayCard key={toDateKey(day)} day={day} events={eventsForDay(data.events, day)} clients={data.clients} compact={view === "week"} />
            ))}
          </div>
        )
      ) : (
        <EmptyState title="אין אירועים ביומן" body="ברגע שתוסיפי אירוע הוא יופיע כאן לפי תאריך." />
      )}
    </>
  );
}

function MonthView({
  days,
  events,
  clients,
  cursor
}: {
  days: Date[];
  events: Event[];
  clients: { id: string; name: string }[];
  cursor: Date;
}) {
  return (
    <Card>
      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-sm font-black text-clay">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day);
          const muted = day.getMonth() !== cursor.getMonth();
          return (
            <div key={toDateKey(day)} className={`min-h-32 rounded-3xl border p-2 ${muted ? "border-clay/5 bg-white/35 text-clay/70" : "border-white/70 bg-white/60 text-ink"}`}>
              <p className="mb-2 text-sm font-black">{day.getDate()}</p>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventPill key={event.id} event={event} clients={clients} />
                ))}
                {dayEvents.length > 3 ? <p className="text-xs font-black text-clay">+{dayEvents.length - 3} עוד</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DayCard({
  day,
  events,
  clients,
  compact
}: {
  day: Date;
  events: Event[];
  clients: { id: string; name: string }[];
  compact?: boolean;
}) {
  return (
    <Card className={compact ? "p-4" : ""}>
      <div className="mb-4 flex items-center gap-3">
        <CalendarDays className="text-coral" />
        <h2 className={`${compact ? "text-lg" : "text-2xl"} font-black text-ink`}>{formatFullDate(day)}</h2>
      </div>
      {events.length ? (
        <div className="grid gap-3">
          {events.map((event) => {
            const client = clients.find((item) => item.id === event.clientId);
            return (
              <Link key={event.id} href={`/events/${event.id}`} className="block rounded-3xl bg-white/60 p-4 transition hover:bg-peach/50">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-lg font-black text-ink">
                      {event.startTime} · {event.title}
                    </p>
                    <p className="text-sm font-bold text-clay">
                      {client?.name || "ללא לקוח"} · {event.address || "ללא כתובת"}
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="rounded-3xl bg-white/50 p-4 text-sm font-bold text-clay">אין אירועים ביום הזה.</p>
      )}
    </Card>
  );
}

function EventPill({ event, clients }: { event: Event; clients: { id: string; name: string }[] }) {
  const client = clients.find((item) => item.id === event.clientId);
  return (
    <Link href={`/events/${event.id}`} className="block rounded-2xl bg-peach/70 px-2 py-2 text-xs font-black text-ink transition hover:bg-coral hover:text-white">
      <span className="block truncate">{event.startTime} · {event.title}</span>
      <span className="block truncate text-[11px] opacity-80">{client?.name || "ללא לקוח"}</span>
    </Link>
  );
}

function getInitialCursor(events: Event[]) {
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date))[0];
  return upcoming ? parseLocalDate(upcoming.date) : new Date();
}

function getVisibleDays(cursor: Date, view: CalendarView) {
  if (view === "day") return [startOfDay(cursor)];
  if (view === "week") return buildWeek(cursor);
  return buildMonth(cursor);
}

function buildWeek(cursor: Date) {
  const start = startOfWeek(cursor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function buildMonth(cursor: Date) {
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function moveCursor(cursor: Date, view: CalendarView, direction: -1 | 1) {
  if (view === "day") return addDays(cursor, direction);
  if (view === "week") return addDays(cursor, direction * 7);
  return new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1);
}

function getCalendarTitle(cursor: Date, view: CalendarView) {
  if (view === "day") return formatFullDate(cursor);
  if (view === "week") {
    const week = buildWeek(cursor);
    return `${formatShortDate(week[0])} - ${formatShortDate(week[6])}`;
  }
  return cursor.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
}

function eventsForDay(events: Event[], day: Date) {
  const key = toDateKey(day);
  return events.filter((event) => event.date === key).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function startOfWeek(date: Date) {
  const day = startOfDay(date);
  day.setDate(day.getDate() - day.getDay());
  return day;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("he-IL", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
}
