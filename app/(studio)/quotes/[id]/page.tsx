"use client";

import { Card, InlineLink, PageHeader, StatCard } from "@/components/ui";
import { calculateQuotePricing, formatCurrency, formatPercent } from "@/lib/pricing";
import { useStudioData } from "@/lib/storage";

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const { data } = useStudioData();
  const quote = data.quotes.find((item) => item.id === params.id);

  if (!quote) {
    return <PageHeader title="הצעה לא נמצאה" action={<InlineLink href="/quotes">חזרה להצעות</InlineLink>} />;
  }

  const event = data.events.find((item) => item.id === quote.eventId);
  const product = data.products.find((item) => item.id === quote.productId);
  const pricing = calculateQuotePricing(quote);

  return (
    <>
      <PageHeader title={`הצעה · ${event?.title || "ללא אירוע"}`} description="פירוט הצעה מתוך הדאטה השמור." action={<InlineLink href="/quotes">עריכת הצעות</InlineLink>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="מחיר למשתתף" value={formatCurrency(quote.pricePerParticipantIncVat)} tone="bg-peach" />
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
          ההצעה מבוססת על {quote.participantCount} משתתפים, מוצר: {product?.name || "לא נבחר"}, ועלות יחידה של {formatCurrency(quote.unitCostExVat)} לפני מע״מ.
        </p>
      </Card>
    </>
  );
}
