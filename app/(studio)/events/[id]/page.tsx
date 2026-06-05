import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Paintbrush, Users } from "lucide-react";
import { Card, InlineLink, PageHeader, StatCard, StatusBadge, StatusTimeline } from "@/components/ui";
import { employees, getClient, getEvent, getProduct, studioTasks } from "@/lib/data";
import { calculateEventPricing, formatCurrency, formatPercent } from "@/lib/pricing";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = getEvent(params.id);
  if (!event) notFound();

  const client = getClient(event.clientId);
  const product = getProduct(event.productId);
  const pricing = calculateEventPricing(event);
  const tasks = studioTasks.filter((task) => task.eventId === event.id);

  return (
    <>
      <PageHeader
        title={event.title}
        description={`${client?.name} · ${event.customEventType}`}
        action={<InlineLink href="/events">חזרה לאירועים</InlineLink>}
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
              <p className="font-bold text-clay">{event.date} · {event.time}</p>
            </div>
            <StatusTimeline status={event.status} />
            <p className="text-lg leading-8 text-ink">{event.eventDescription}</p>
          </Card>

          <Card>
            <h2 className="mb-4 text-2xl font-black text-ink">פרטי שטח</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={<MapPin size={18} />} label="מקום" value={`${event.venue}, ${event.city}`} />
              <Info icon={<Users size={18} />} label="לקוח" value={`${client?.contactName} · ${client?.phone}`} />
              <Info icon={<Paintbrush size={18} />} label="מוצר" value={product?.name ?? "לא נבחר"} />
              <Info icon={<CalendarDays size={18} />} label="משך" value={`${event.eventHours} שעות, לא כולל נסיעה`} />
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
          <div className="mt-5 rounded-3xl bg-lavender/50 p-4">
            <p className="font-black text-ink">צוות</p>
            {event.assignments.map((assignment) => {
              const employee = employees.find((item) => item.id === assignment.employeeId);
              return (
                <p key={assignment.employeeId} className="mt-1 font-bold text-clay">
                  {employee?.name} · {assignment.eventHours} שעות
                </p>
              );
            })}
          </div>
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
