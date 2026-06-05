import { AlertTriangle, CalendarClock, ClipboardCheck, Heart, PackageSearch } from "lucide-react";
import { Card, InlineLink, PageHeader, StatCard } from "@/components/ui";
import { dailySupportMessage, events, getProduct, inventory, products, studioTasks } from "@/lib/data";

export default function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const nextEvent =
    events
      .filter((event) => event.date >= today)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0] ?? events[0];
  const lowInventory = inventory.filter((item) => item.quantityOnHand - item.quantityReserved <= item.reorderThreshold);
  const waitingTasks = studioTasks.filter((task) => task.status !== "done");

  return (
    <>
      <PageHeader title="היום במנותו" description="מבט אחד על האירוע הבא, מה להכין, מה מחכה בסטודיו ומה כדאי להזמין לפני שנהיה צפוף." />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="אירועים פתוחים" value={`${events.length}`} tone="bg-coral" />
        <StatCard label="משימות סטודיו" value={`${waitingTasks.length}`} tone="bg-lavender" />
        <StatCard label="מוצרים לבדיקה" value={`${lowInventory.length}`} tone="bg-mint" />
        <StatCard label="מע״מ מוגדר" value="18%" tone="bg-sky" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <CalendarClock className="text-coral" />
            <h2 className="text-2xl font-black text-ink">האירוע הבא</h2>
          </div>
          <div className="rounded-3xl bg-peach/45 p-5">
            <p className="text-3xl font-black text-ink">{nextEvent.title}</p>
            <p className="mt-2 font-bold text-clay">
              {nextEvent.date} · {nextEvent.time} · {nextEvent.city}
            </p>
            <p className="mt-4 leading-7 text-ink">{nextEvent.eventDescription}</p>
            <div className="mt-5">
              <InlineLink href={`/events/${nextEvent.id}`}>לפתוח אירוע</InlineLink>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Heart className="text-coral" />
            <h2 className="text-2xl font-black text-ink">הפתק של היום</h2>
          </div>
          <p className="rounded-3xl bg-blush/35 p-5 text-xl font-bold leading-9 text-ink">{dailySupportMessage}</p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <ClipboardCheck className="text-coral" />
            <h2 className="text-2xl font-black text-ink">מה צריך להכין</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {events
              .filter((event) => ["quote_needed", "lead", "preparing"].includes(event.status))
              .map((event) => (
                <div key={event.id} className="rounded-3xl bg-white/60 p-4">
                  <p className="font-black text-ink">{event.title}</p>
                  <p className="mt-1 text-sm font-bold text-clay">
                    {event.participantCount} משתתפים · {getProduct(event.productId)?.name}
                  </p>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <PackageSearch className="text-coral" />
            <h2 className="text-2xl font-black text-ink">מלאי שכדאי לבדוק</h2>
          </div>
          <div className="space-y-3">
            {lowInventory.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId);
              const available = item.quantityOnHand - item.quantityReserved;
              return (
                <div key={item.id} className="flex items-center justify-between rounded-3xl bg-white/60 p-4 font-bold">
                  <span>{product?.name}</span>
                  <span className="inline-flex items-center gap-2 text-clay">
                    <AlertTriangle size={17} />
                    {available} פנוי
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
