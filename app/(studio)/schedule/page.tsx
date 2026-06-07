"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { useStudioData } from "@/lib/storage";
import type { Employee, EmployeeWorkLog, Event } from "@/lib/types";

export default function SchedulePage() {
  const { data } = useStudioData();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const monthKey = toMonthKey(cursor);
  const monthEvents = useMemo(
    () =>
      data.events
        .filter((event) => event.date.startsWith(monthKey) && event.status !== "cancelled")
        .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)),
    [data.events, monthKey]
  );

  const title = formatMonthLabel(cursor);

  function moveMonth(direction: -1 | 1) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  function downloadImage() {
    downloadScheduleImage({
      events: monthEvents,
      employees: data.employees,
      workLogs: data.employeeWorkLogs ?? [],
      monthTitle: title
    });
  }

  return (
    <>
      <PageHeader
        title="סידור עבודה"
        description="מבט חודשי נוח לשיתוף: אירועים, תאריכים, שעות, כתובות ומי עובדת בכל אירוע."
        action={
          <ActionButton onClick={downloadImage}>
            <span className="inline-flex items-center gap-2">
              <Download size={17} />
              הורדה כתמונה
            </span>
          </ActionButton>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral text-white">
              <CalendarClock size={22} />
            </span>
            <div>
              <p className="text-sm font-black text-clay">חודש מוצג</p>
              <h2 className="text-2xl font-black text-ink">{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full bg-white/70 p-3 text-clay transition hover:text-ink" onClick={() => moveMonth(-1)} aria-label="חודש קודם">
              <ChevronRight size={20} />
            </button>
            <button type="button" className="rounded-full bg-white/70 px-4 py-3 text-sm font-black text-clay transition hover:text-ink" onClick={() => setCursor(startOfMonth(new Date()))}>
              החודש
            </button>
            <button type="button" className="rounded-full bg-white/70 p-3 text-clay transition hover:text-ink" onClick={() => moveMonth(1)} aria-label="חודש הבא">
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      </Card>

      {monthEvents.length ? (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-clay">אירועי החודש</p>
              <h2 className="text-2xl font-black text-ink">{monthEvents.length} אירועים בסידור</h2>
            </div>
            <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-emerald-950">כולל שיבוץ ושעות רשומות</span>
          </div>
          <div className="space-y-3">
            {monthEvents.map((event) => (
              <ScheduleEventRow key={event.id} event={event} employees={data.employees} workLogs={data.employeeWorkLogs ?? []} />
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState title="אין אירועים בחודש הזה" body="כשיהיו אירועים בחודש הנבחר, הם יופיעו כאן ויהיה אפשר להוריד סידור כתמונה." />
      )}
    </>
  );
}

function ScheduleEventRow({ event, employees, workLogs }: { event: Event; employees: Employee[]; workLogs: EmployeeWorkLog[] }) {
  const assignedEmployees = getAssignedEmployees(event, employees);
  const loggedHours = getLoggedHours(event.id, workLogs);

  return (
    <div className="rounded-[24px] bg-white/60 p-4">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1fr_0.8fr] lg:items-center">
        <div>
          <h3 className="text-xl font-black text-ink">{event.title}</h3>
          <p className="mt-1 text-sm font-bold text-clay">
            {formatDate(parseLocalDate(event.date))} · {formatTimeRange(event)}
          </p>
        </div>
        <div>
          <p className="text-xs font-black text-clay">איפה</p>
          <p className="font-bold text-ink">{event.address || "לא צוינה כתובת"}</p>
        </div>
        <div>
          <p className="text-xs font-black text-clay">איש קשר</p>
          <p className="font-bold text-ink">{formatContact(event)}</p>
        </div>
        <div>
          <p className="text-xs font-black text-clay">מי עובדת</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {assignedEmployees.length ? (
              assignedEmployees.map((employee) => (
                <span key={employee.id} className="rounded-full bg-peach/70 px-3 py-1 text-sm font-black text-ink">
                  {employee.name}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-black text-clay">אין שיבוץ</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-black text-clay">{event.participantCount} משתתפים</span>
          <span className="rounded-full bg-mint px-3 py-1 text-sm font-black text-emerald-950">{formatNumber(loggedHours)} ש׳ נרשמו</span>
        </div>
      </div>
    </div>
  );
}

function downloadScheduleImage({
  events,
  employees,
  workLogs,
  monthTitle
}: {
  events: Event[];
  employees: Employee[];
  workLogs: EmployeeWorkLog[];
  monthTitle: string;
}) {
  const width = 1400;
  const padding = 70;
  const rowGap = 22;
  const rowHeight = 212;
  const headerHeight = 190;
  const footerHeight = 70;
  const height = Math.max(720, headerHeight + events.length * (rowHeight + rowGap) + footerHeight);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#fff8f0";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#f9ded8";
  ctx.fillRect(0, 0, width, 18);
  ctx.fillStyle = "#f27f78";
  ctx.fillRect(width - 280, 0, 210, 18);

  setRtl(ctx);
  drawText(ctx, "Manuto Flow", width - padding, 72, 36, "#2f2927", "bold");
  drawText(ctx, `סידור עבודה · ${monthTitle}`, width - padding, 122, 54, "#2f2927", "bold");
  drawText(ctx, `${events.length} אירועים · הופק ${formatDate(new Date())}`, width - padding, 166, 26, "#9b6f66", "bold");

  let y = headerHeight;
  events.forEach((event, index) => {
    const assignedEmployees = getAssignedEmployees(event, employees);
    const loggedHours = getLoggedHours(event.id, workLogs);
    const rowY = y + index * (rowHeight + rowGap);

    roundRect(ctx, padding, rowY, width - padding * 2, rowHeight, 34, "#ffffff");
    ctx.fillStyle = index % 2 === 0 ? "#fff0e7" : "#f2f7ed";
    ctx.fillRect(width - padding - 14, rowY + 28, 8, rowHeight - 56);

    drawText(ctx, event.title, width - padding - 38, rowY + 48, 32, "#2f2927", "bold");
    drawText(ctx, `${formatDate(parseLocalDate(event.date))} · ${formatTimeRange(event)}`, width - padding - 38, rowY + 88, 25, "#9b6f66", "bold");
    drawText(ctx, `איפה: ${event.address || "לא צוינה כתובת"}`, width - padding - 38, rowY + 124, 24, "#2f2927", "bold");
    drawText(ctx, `איש קשר: ${formatContact(event)}`, width - padding - 38, rowY + 154, 22, "#2f2927", "bold");
    drawText(ctx, `מי עובדת: ${assignedEmployees.length ? assignedEmployees.map((employee) => employee.name).join(", ") : "אין שיבוץ"}`, width - padding - 38, rowY + 184, 22, "#2f2927", "bold");

    const metaRight = padding + 360;
    drawPill(ctx, `משתתפים: ${event.participantCount}`, metaRight, rowY + 38, 250, "#ffe4db", "#2f2927");
    drawPill(ctx, `שעות נרשמו: ${formatNumber(loggedHours)}`, metaRight, rowY + 92, 250, "#d7f3e7", "#174f3b");
  });

  drawText(ctx, "סידור עבודה פנימי · מנותו", width - padding, height - 34, 22, "#9b6f66", "bold");

  const link = document.createElement("a");
  link.download = `manuto-schedule-${monthTitle.replace(/\s+/g, "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function getAssignedEmployees(event: Event, employees: Employee[]) {
  return event.assignments
    .map((assignment) => employees.find((employee) => employee.id === assignment.employeeId))
    .filter((employee): employee is Employee => Boolean(employee));
}

function getLoggedHours(eventId: string, workLogs: EmployeeWorkLog[]) {
  return workLogs.filter((log) => log.eventId === eventId).reduce((sum, log) => sum + log.hours, 0);
}

function setRtl(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  (ctx as CanvasRenderingContext2D & { direction: CanvasDirection }).direction = "rtl";
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, weight = "normal") {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  ctx.fillText(text, x, y);
}

function drawPill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, background: string, color: string) {
  roundRect(ctx, x, y, width, 40, 20, background);
  drawText(ctx, text, x + width - 22, y + 27, 20, color, "bold");
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function formatTimeRange(event: Event) {
  if (!event.startTime && !event.endTime) return "שעה לא צוינה";
  if (!event.endTime) return event.startTime;
  return `${event.startTime}-${event.endTime}`;
}

function formatContact(event: Event) {
  if (event.contactName && event.contactPhone) return `${event.contactName} · ${event.contactPhone}`;
  return event.contactName || event.contactPhone || "לא צוין";
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("he-IL", { maximumFractionDigits: 2 }).format(value);
}
