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
  const pricing = calculateQuotePricing(quote, data.businessSettings.vatRate);
  const totalItems = quote.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <PageHeader title={`הצעה · ${event?.title || "ללא אירוע"}`} description="פירוט הצעה מתוך הדאטה השמור." action={<InlineLink href="/quotes">עריכת הצעות</InlineLink>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="כמות פריטים" value={`${totalItems}`} tone="bg-peach" />
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
        <div className="mt-5 overflow-hidden rounded-3xl bg-peach/60">
          <div className="grid grid-cols-[1.4fr_0.7fr_1fr_1fr] gap-3 border-b border-white/70 p-4 text-sm font-black text-clay">
            <span>פריט</span>
            <span>כמות</span>
            <span>מחיר ללקוח</span>
            <span>עלות</span>
          </div>
          {quote.items.map((line) => {
            const product = data.products.find((item) => item.id === line.productId);
            return (
              <div key={line.id} className="grid grid-cols-[1.4fr_0.7fr_1fr_1fr] gap-3 border-b border-white/60 p-4 text-sm font-bold text-ink last:border-b-0">
                <span>{product?.name || "פריט לא נבחר"}</span>
                <span>{line.quantity}</span>
                <span>{formatCurrency(line.pricePerParticipantIncVat)}</span>
                <span>{formatCurrency(line.unitCostExVat)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
