"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, ClipboardCheck, Heart, PackageSearch } from "lucide-react";
import { ActionButton, Card, InlineLink, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/pricing";
import { useStudioData } from "@/lib/storage";
import type { Event } from "@/lib/types";

const manutoLogoUrl = "https://manuto.co.il/wp-content/uploads/2023/04/manuto_logo_pink_black-e1703362069976.png";
const lowStockThreshold = 10;

export default function DashboardPage() {
  const { data } = useStudioData();
  const today = new Date().toISOString().slice(0, 10);
  const nextEvent =
    data.events
      .filter((event) => event.date >= today)
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0] ?? data.events[0];
  const openQuotes = data.quotes.filter((quote) => quote.status !== "approved");
  const lowInventory = data.products
    .filter((product) => product.isActive)
    .map((product) => {
      const inventory = data.inventory.find((item) => item.productId === product.id);
      const reservedQuantity = getReservedQuantity(data.events, product.id, today);
      const quantityOnHand = inventory?.quantityOnHand ?? 0;

      return {
        product,
        reservedQuantity,
        availableQuantity: quantityOnHand - reservedQuantity
      };
    })
    .filter((item) => item.availableQuantity < lowStockThreshold)
    .sort((first, second) => first.availableQuantity - second.availableQuantity);
  const studioEvents = data.events.filter((event) => ["completed", "studio_work", "glazing", "firing", "packing"].includes(event.status));
  const dailySupportMessage = data.dailySupportMessages[0] ?? "בואי נתחיל בדבר הבא שעל השולחן.";

  return (
    <>
      <section className="motion-rise mb-6 overflow-hidden rounded-[2rem] border border-clay/10 bg-paper/82 p-5 shadow-[0_26px_80px_rgba(122,76,62,0.12),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-xl sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <img src={manutoLogoUrl} alt="Manuto" className="mb-6 h-auto w-44 max-w-[70vw]" />
            <div className="mb-4 h-1.5 w-16 rounded-full bg-coral/80" />
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-normal text-ink sm:text-5xl">היום במנותו</h1>
            <p className="mt-3 max-w-2xl text-lg font-bold leading-8 text-clay/88">מסך עבודה יומי שמחזיק אירועים, סטודיו, מלאי והצעות במקום אחד.</p>
          </div>

          <div className="rounded-[1.6rem] border border-clay/10 bg-white/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-clay">
              <CalendarClock size={18} className="text-coral" />
              האירוע הבא
            </div>
            {nextEvent ? (
              <>
                <p className="text-2xl font-black text-ink">{nextEvent.title}</p>
                <p className="mt-2 font-bold text-clay">
                  {nextEvent.date} · {nextEvent.startTime || "ללא שעה"} · {nextEvent.address || "ללא כתובת"}
                </p>
                <div className="mt-4">
                  <InlineLink href="/events">לערוך אירועים</InlineLink>
                </div>
              </>
            ) : (
              <>
                <p className="text-2xl font-black text-ink">עוד אין אירועים.</p>
                <p className="mt-2 font-bold text-clay">בואי נוסיף את הסדנה הראשונה.</p>
                <div className="mt-4">
                  <InlineLink href="/events">הוספת אירוע ראשון</InlineLink>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="אירועים" value={`${data.events.length}`} tone="bg-coral" />
        <StatCard label="הצעות פתוחות" value={`${openQuotes.length}`} tone="bg-lavender" />
        <StatCard label="פריטים" value={`${data.products.length}`} tone="bg-mint" />
        <StatCard label="לקוחות מתעניינים" value={`${data.clients.filter((client) => client.clientStatus === "interested").length}`} tone="bg-sky" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <CalendarClock className="text-coral" />
            <h2 className="text-2xl font-black text-ink">תיאור האירוע הבא</h2>
          </div>
          {nextEvent ? (
            <div className="surface-quiet rounded-[1.35rem] p-5">
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
            <div className="surface-quiet rounded-[1.35rem] p-5">
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
          <p className="surface-quiet rounded-[1.35rem] p-5 text-xl font-bold leading-9 text-ink">{dailySupportMessage}</p>
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
                  <div key={quote.id} className="surface-quiet rounded-[1.25rem] p-4">
                    <p className="font-black text-ink">{event?.title || "הצעה ללא אירוע"}</p>
                    <p className="mt-1 text-sm font-bold text-clay">{formatCurrency(quote.items.reduce((sum, item) => sum + item.quantity * item.pricePerParticipantIncVat, 0))}</p>
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
                return (
                  <div key={item.product.id} className="surface-quiet flex items-center justify-between rounded-[1.25rem] p-4 font-bold">
                    <span>{item.product.name}</span>
                    <span className="inline-flex items-center gap-2 text-clay">
                      <AlertTriangle size={17} />
                      {item.availableQuantity} פנוי
                      {item.reservedQuantity ? ` · ${item.reservedQuantity} שמורים` : ""}
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
                <Link key={event.id} href="/events" className="surface-quiet rounded-[1.25rem] p-4 font-bold text-ink transition hover:-translate-y-0.5">
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

function getReservedQuantity(events: Event[], productId: string, today: string) {
  return events
    .filter((event) => event.date >= today && !["cancelled", "delivered", "paid", "closed"].includes(event.status))
    .flatMap((event) => event.items ?? [])
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}
