"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { QuoteBuilder } from "@/components/quote-builder";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { calculateQuotePricing, formatCurrency, formatPercent } from "@/lib/pricing";
import { useStudioData } from "@/lib/storage";
import type { Quote } from "@/lib/types";

export default function QuotesPage() {
  const { data, addQuote, updateQuote, deleteQuote } = useStudioData();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [query, setQuery] = useState("");

  const filteredQuotes = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return data.quotes;

    return data.quotes.filter((quote) => {
      const client = data.clients.find((item) => item.id === quote.clientId);
      const event = data.events.find((item) => item.id === quote.eventId);
      const product = data.products.find((item) => item.id === quote.productId);
      return [client?.name ?? "", event?.title ?? "", product?.name ?? ""].some((field) => field.toLowerCase().includes(value));
    });
  }, [data.clients, data.events, data.products, data.quotes, query]);

  return (
    <>
      <PageHeader
        title="הצעות"
        description="הצעות מחיר שאפשר ליצור, לערוך ולמחוק. המספרים מתעדכנים תוך כדי עבודה."
        action={
          <ActionButton
            onClick={() => {
              setEditingQuote(null);
              setIsBuilderOpen(true);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={17} />
              הצעה חדשה
            </span>
          </ActionButton>
        }
      />

      {isBuilderOpen ? (
        <div className="mb-8">
          <QuoteBuilder
            data={data}
            editingQuote={editingQuote}
            onSave={(quote) => {
              if (editingQuote) updateQuote(quote);
              else addQuote(quote);
            }}
            onDone={() => {
              setIsBuilderOpen(false);
              setEditingQuote(null);
            }}
          />
        </div>
      ) : null}

      <Card className="mb-5">
        <label className="flex items-center gap-3">
          <Search className="text-coral" size={20} />
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש הצעה לפי לקוח, אירוע או פריט" />
        </label>
      </Card>

      {filteredQuotes.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredQuotes.map((quote) => {
            const client = data.clients.find((item) => item.id === quote.clientId);
            const event = data.events.find((item) => item.id === quote.eventId);
            const product = data.products.find((item) => item.id === quote.productId);
            const pricing = calculateQuotePricing(quote);

            return (
              <Card key={quote.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-ink">{event?.title || "הצעה ללא אירוע"}</h2>
                    <p className="mt-1 font-bold text-clay">{client?.name || "ללא לקוח"} · {product?.name || "ללא פריט"}</p>
                  </div>
                  <div className="flex gap-2">
                    <ActionButton tone="quiet" onClick={() => { setEditingQuote(quote); setIsBuilderOpen(true); }}>
                      <Edit3 size={16} />
                    </ActionButton>
                    <ActionButton tone="danger" onClick={() => window.confirm("למחוק את ההצעה?") && deleteQuote(quote.id)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Mini label="סה״כ ללקוח כולל מע״מ" value={formatCurrency(pricing.revenueIncVat)} />
                  <Mini label="כמה אוויר נשאר" value={formatPercent(pricing.margin)} />
                </div>
                <p className="mt-4 font-bold text-clay">
                  {quote.participantCount} משתתפים · {formatCurrency(quote.pricePerParticipantIncVat)} למשתתף
                </p>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="אין הצעות עדיין" body="אפשר ליצור הצעה ראשונה ולראות את הרווחיות מתעדכנת בזמן אמת." />
      )}
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/60 p-4">
      <p className="text-sm font-black text-clay">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}
