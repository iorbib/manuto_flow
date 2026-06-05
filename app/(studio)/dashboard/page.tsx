"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, ClipboardCheck, Heart, PackageSearch } from "lucide-react";
import { ActionButton, Card, InlineLink, PageHeader, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/pricing";
import { useStudioData } from "@/lib/storage";

export default function DashboardPage() {
  const { data } = useStudioData();
  const today = new Date().toISOString().slice(0, 10);
  const nextEvent =
    data.events
      .filter((event) => event.date >= today)
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0] ?? data.events[0];
  const openQuotes = data.quotes.filter((quote) => quote.status !== "approved");
  const lowInventory = data.inventory.filter((item) => item.quantityOnHand - item.quantityReserved <= item.reorderThreshold);
  const studioEvents = data.events.filter((event) => ["completed", "studio_work", "glazing", "firing", "packing"].includes(event.status));
  const dailySupportMessage = data.dailySupportMessages[0] ?? "בואי נתחיל בדבר הבא שעל השולחן.";

  return (
    <>
      <PageHeader title="היום במנותו" description="דשבורד שמחובר לדאטה ששמרת: אירועים, הצעות, מלאי וסטודיו." />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="אירועים" value={`${data.events.length}`} tone="bg-coral" />
        <StatCard label="הצעות פתוחות" value={`${openQuotes.length}`} tone="bg-lavender" />
        <StatCard label="פריטים" value={`${data.products.length}`} tone="bg-mint" />
        <StatCard label="עובדות פעילות" value={`${data.employees.filter((employee) => employee.isActive).length}`} tone="bg-sky" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <CalendarClock className="text-coral" />
            <h2 className="text-2xl font-black text-ink">האירוע הבא</h2>
          </div>
          {nextEvent ? (
            <div className="rounded-3xl bg-peach/45 p-5">
              <p className="text-3xl font-black text-ink">{nextEvent.title}</p>
              <p className="mt-2 font-bold text-clay">
                {nextEvent.date} · {nextEvent.startTime} · {nextEvent.address || "ללא כתובת"}
              </p>
              <p className="mt-4 leading-7 text-ink">{nextEvent.eventDescription || nextEvent.internalNotes || "אין תיאור עדיין."}</p>
              <div className="mt-5">
                <InlineLink href="/events">לערוך אירועים</InlineLink>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-peach/45 p-5">
              <p className="text-2xl font-black text-ink">עוד אין אירועים.</p>
              <p className="mt-2 font-bold text-clay">בואי נוסיף את הסדנה הראשונה.</p>
              <div className="mt-5">
                <InlineLink href="/events">הוספת אירוע ראשון</InlineLink>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Heart className="text-coral" />
            <h2 className="text-2xl font-black text-ink">הפתק של היום</h2>
          </div>
          <p className="rounded-3xl bg-blush/35 p-5 text-xl font-bold leading-9 text-ink">{dailySupportMessage}</p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="text-coral" />
              <h2 className="text-2xl font-black text-ink">הצעות פתוחות</h2>
            </div>
            <Link href="/quotes">
              <ActionButton tone="quiet">לניהול</ActionButton>
            </Link>
          </div>
          {openQuotes.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {openQuotes.map((quote) => {
                const event = data.events.find((item) => item.id === quote.eventId);
                return (
                  <div key={quote.id} className="rounded-3xl bg-white/60 p-4">
                    <p className="font-black text-ink">{event?.title || "הצעה ללא אירוע"}</p>
                    <p className="mt-1 text-sm font-bold text-clay">{formatCurrency(quote.participantCount * quote.pricePerParticipantIncVat)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-bold text-clay">אין הצעות פתוחות כרגע.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PackageSearch className="text-coral" />
              <h2 className="text-2xl font-black text-ink">מלאי שכדאי לבדוק</h2>
            </div>
            <Link href="/products">
              <ActionButton tone="quiet">פריטים</ActionButton>
            </Link>
          </div>
          {lowInventory.length ? (
            <div className="space-y-3">
              {lowInventory.map((item) => {
                const product = data.products.find((candidate) => candidate.id === item.productId);
                const available = item.quantityOnHand - item.quantityReserved;
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-3xl bg-white/60 p-4 font-bold">
                    <span>{product?.name || "פריט שנמחק"}</span>
                    <span className="inline-flex items-center gap-2 text-clay">
                      <AlertTriangle size={17} />
                      {available} פנוי
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-bold text-clay">המלאי נראה רגוע כרגע.</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-2xl font-black text-ink">סטודיו</h2>
          {studioEvents.length ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {studioEvents.map((event) => (
                <Link key={event.id} href="/events" className="rounded-3xl bg-lavender/45 p-4 font-bold text-ink">
                  {event.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-bold text-clay">אין כרגע אירועים שמחכים לעבודה בסטודיו.</p>
          )}
        </Card>
      </div>
    </>
  );
}
