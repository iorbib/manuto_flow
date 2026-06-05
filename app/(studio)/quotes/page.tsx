import Link from "next/link";
import { QuoteBuilder } from "@/components/quote-builder";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { events, getEvent, quotes } from "@/lib/data";

export default function QuotesPage() {
  return (
    <>
      <PageHeader title="הצעות" description="מקום אחד לבנות הצעה, לראות רווחיות, ולשמור טיוטה לפני שליחה." />
      <QuoteBuilder />

      <h2 className="mb-3 mt-8 text-2xl font-black text-ink">טיוטות והצעות קיימות</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {quotes.map((quote) => {
          const event = getEvent(quote.eventId);
          return (
            <Card key={quote.id}>
              <Link href={`/quotes/${quote.id}`} className="text-xl font-black text-ink hover:text-coral">
                {event?.title}
              </Link>
              <p className="mt-2 font-bold text-clay">נוצרה בתאריך {quote.createdAt}</p>
              {event ? <div className="mt-4"><StatusBadge status={event.status} /></div> : null}
            </Card>
          );
        })}
        {events
          .filter((event) => event.status === "quote_needed")
          .map((event) => (
            <Card key={event.id}>
              <p className="text-xl font-black text-ink">{event.title}</p>
              <p className="mt-2 font-bold text-clay">מחכה להצעת מחיר</p>
            </Card>
          ))}
      </div>
    </>
  );
}
