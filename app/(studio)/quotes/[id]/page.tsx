import { notFound } from "next/navigation";
import { Card, InlineLink, PageHeader, StatCard } from "@/components/ui";
import { getEvent, getProduct, getQuote } from "@/lib/data";
import { calculateEventPricing, formatCurrency, formatPercent } from "@/lib/pricing";

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = getQuote(params.id);
  if (!quote) notFound();
  const event = getEvent(quote.eventId);
  if (!event) notFound();
  const product = getProduct(event.productId);
  const pricing = calculateEventPricing(event);

  return (
    <>
      <PageHeader title={`הצעה · ${event.title}`} description="פירוט הצעה ללקוח עם תמחור פנימי למנותו." action={<InlineLink href="/quotes">חזרה להצעות</InlineLink>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="מחיר למשתתף" value={formatCurrency(event.participantPriceIncVat)} tone="bg-peach" />
        <StatCard label="סה״כ כולל מע״מ" value={formatCurrency(pricing.revenueIncVat)} tone="bg-coral" />
        <StatCard label="נשאר לפני מסים ושאר הוצאות" value={formatCurrency(pricing.grossProfit)} tone="bg-mint" />
        <StatCard label="כמה אוויר נשאר" value={formatPercent(pricing.margin)} tone="bg-sky" />
      </div>
      <Card className="mt-5">
        <h2 className="text-2xl font-black text-ink">מה כלול</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["כלי קרמיקה לכל משתתף", "צבעים וכלים", "הנחיה במקום", "איסוף עבודות", "גלזורה ושריפה", "אריזה והחזרה ללקוח"].map((item) => (
            <div key={item} className="rounded-3xl bg-white/60 p-4 font-bold text-ink">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-3xl bg-peach/60 p-5 font-bold leading-8 text-ink">
          ההצעה מבוססת על {event.participantCount} משתתפים, מוצר: {product?.name}, משך אירוע של {event.eventHours} שעות. הלקוח מספק מקום, שולחנות,
          כסאות וגישה למים.
        </p>
      </Card>
    </>
  );
}
