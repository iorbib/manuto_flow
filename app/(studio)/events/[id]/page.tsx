"use client";

import { CalendarDays, MapPin, Paintbrush, Users } from "lucide-react";
import { Card, InlineLink, PageHeader, StatCard, StatusBadge, StatusTimeline } from "@/components/ui";
import { calculateEventPricing, formatCurrency, formatPercent } from "@/lib/pricing";
import { useStudioData } from "@/lib/storage";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { data } = useStudioData();
  const event = data.events.find((item) => item.id === params.id);

  if (!event) {
    return (
      <>
        <PageHeader title="אירוע לא נמצא" action={<InlineLink href="/events">חזרה לאירועים</InlineLink>} />
      </>
    );
  }

  const client = data.clients.find((item) => item.id === event.clientId);
  const product = data.products.find((item) => item.id === event.productId) ?? data.products[0];
  const pricing = product
    ? calculateEventPricing(event, product, data.employees)
    : { revenueIncVat: 0, grossProfit: 0, margin: 0, ceramicCost: 0, employeeCost: 0 };
  const tasks = data.studioTasks.filter((task) => task.eventId === event.id);

  return (
    <>
      <PageHeader
        title={event.title}
        description={`${client?.name || "ללא לקוח"} · ${event.customEventType || "ללא סוג חופשי"}`}
        action={<InlineLink href="/events">עריכת אירועים</InlineLink>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="משתתפים" value={`${event.participantCount}`} tone="bg-peach" />
        <StatCard label="הכנסה כולל מע״מ" value={formatCurrency(pricing.revenueIncVat)} tone="bg-mint" />
        <StatCard label="נשאר לפני מסים ושאר הוצאות" value={formatCurrency(pricing.grossProfit)} tone="bg-coral" />
        <StatCard label="כמה אוויר נשאר" value={formatPercent(pricing.margin)} tone="bg-sky" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={event.status} />
              <p className="font-bold text-clay">
                {event.date} · {event.startTime}-{event.endTime}
              </p>
            </div>
            <StatusTimeline status={event.status} />
            <p className="text-lg leading-8 text-ink">{event.eventDescription || "אין תיאור עדיין."}</p>
          </Card>

          <Card>
            <h2 className="mb-4 text-2xl font-black text-ink">פרטי שטח</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={<MapPin size={18} />} label="כתובת" value={event.address || "לא הוגדרה"} />
              <Info icon={<Users size={18} />} label="לקוח" value={`${event.contactName || client?.contactName || "ללא איש קשר"} · ${client?.phone || ""}`} />
              <Info icon={<Paintbrush size={18} />} label="פריט" value={product?.name ?? "לא נבחר"} />
              <Info icon={<CalendarDays size={18} />} label="שטח" value={`${event.hasTables ? "יש שולחנות" : "אין שולחנות"} · ${event.hasChairs ? "יש כיסאות" : "אין כיסאות"} · ${event.hasWater ? "יש מים" : "אין מים"}`} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-2xl font-black text-ink">מחכה בסטודיו</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {tasks.length ? (
                tasks.map((task) => (
                  <div key={task.id} className="rounded-3xl bg-white/60 p-4">
                    <p className="font-black text-ink">{task.title}</p>
                    <p className="mt-1 text-sm font-bold text-clay">עד {task.dueDate}</p>
                  </div>
                ))
              ) : (
                <p className="text-clay">עדיין אין משימות סטודיו לאירוע הזה.</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="h-fit">
          <h2 className="mb-4 text-2xl font-black text-ink">מה יורד מהאירוע</h2>
          <Cost label="קרמיקה" value={pricing.ceramicCost} />
          <Cost label="עובדות" value={pricing.employeeCost} />
          <Cost label="צבעים" value={event.expenses.paintCost} />
          <Cost label="גלזורה" value={event.expenses.glazeCost} />
          <Cost label="אריזה" value={event.expenses.packagingCost} />
          <Cost label="שריפה" value={event.expenses.firingCost} />
          <Cost label="לוגיסטיקה" value={event.expenses.logisticsCost} />
        </Card>
      </div>
    </>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/60 p-4">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-black text-clay">
        {icon}
        {label}
      </p>
      <p className="font-black text-ink">{value}</p>
    </div>
  );
}

function Cost({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-clay/10 py-3 font-bold text-clay">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
