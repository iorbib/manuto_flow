"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { calculateQuotePricing, formatCurrency, formatPercent } from "@/lib/pricing";
import { createId } from "@/lib/storage";
import type { Quote, QuoteItem, StudioData } from "@/lib/types";
import { ActionButton, Card } from "./ui";

function makeQuoteItem(data: StudioData, productId = data.products[0]?.id ?? "", quantity = 10): QuoteItem {
  const product = data.products.find((item) => item.id === productId) ?? data.products[0];
  return {
    id: createId("quote_item"),
    productId: product?.id ?? "",
    quantity,
    pricePerParticipantIncVat: product?.recommendedParticipantPriceIncVat ?? 100,
    unitCostExVat: product?.averageUnitCostExVat ?? 0
  };
}

function makeEmptyQuote(data: StudioData): Quote {
  const employee = data.employees[0];
  return {
    id: "",
    clientId: data.clients[0]?.id ?? "",
    eventId: data.events[0]?.id ?? "",
    items: [makeQuoteItem(data, data.events[0]?.productId, data.events[0]?.participantCount ?? 20)],
    employeeId: employee?.id ?? "",
    employeeHours: data.businessSettings.defaultEventHours,
    employeeHourlyRate: employee?.hourlyRate ?? 0,
    paintCost: data.businessSettings.defaultPaintCost,
    glazeCost: data.businessSettings.defaultGlazeCost,
    packagingCost: data.businessSettings.defaultPackagingCost,
    firingCost: data.businessSettings.defaultFiringCost,
    logisticsCost: data.businessSettings.defaultLogisticsCost,
    status: "draft",
    createdAt: new Date().toISOString().slice(0, 10)
  };
}

export function QuoteBuilder({
  data,
  editingQuote,
  onSave,
  onDone
}: {
  data: StudioData;
  editingQuote?: Quote | null;
  onSave: (quote: Quote) => void;
  onDone?: () => void;
}) {
  const [quote, setQuote] = useState<Quote>(() => makeEmptyQuote(data));

  useEffect(() => {
    if (editingQuote) {
      setQuote(editingQuote);
      return;
    }

    setQuote(makeEmptyQuote(data));
  }, [data, editingQuote]);

  const pricing = useMemo(() => calculateQuotePricing(quote, data.businessSettings.vatRate), [data.businessSettings.vatRate, quote]);

  function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(quote.id ? quote : { ...quote, id: createId("quote"), createdAt: new Date().toISOString().slice(0, 10) });
    onDone?.();
  }

  function updateItem(itemId: string, patch: Partial<QuoteItem>) {
    setQuote((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
      <Card>
        <form onSubmit={submitQuote}>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral text-white">
              <Calculator size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-black text-ink">בואי נבנה הצעה</h2>
              <p className="text-clay">רשימת פריטים עם כמויות, מחירים ועלויות. כל שורה משנה את הסיכום מיד.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-black text-clay">לקוח</span>
              <select className="input" value={quote.clientId} onChange={(event) => setQuote({ ...quote, clientId: event.target.value })}>
                <option value="">ללא לקוח</option>
                {data.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-black text-clay">אירוע</span>
              <select
                className="input"
                value={quote.eventId}
                onChange={(event) => {
                  const selectedEvent = data.events.find((item) => item.id === event.target.value);
                  setQuote({
                    ...quote,
                    eventId: event.target.value,
                    clientId: selectedEvent?.clientId ?? quote.clientId,
                    items: selectedEvent ? [makeQuoteItem(data, selectedEvent.productId, selectedEvent.participantCount)] : quote.items
                  });
                }}
              >
                <option value="">ללא אירוע</option>
                {data.events.map((eventItem) => (
                  <option key={eventItem.id} value={eventItem.id}>
                    {eventItem.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-ink">פריטים בהצעה</h3>
              <ActionButton tone="quiet" onClick={() => setQuote({ ...quote, items: [...quote.items, makeQuoteItem(data)] })}>
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  הוספת שורה
                </span>
              </ActionButton>
            </div>

            {quote.items.map((item, index) => (
              <div key={item.id} className="rounded-3xl bg-white/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="font-black text-clay">שורה {index + 1}</p>
                  {quote.items.length > 1 ? (
                    <ActionButton tone="danger" onClick={() => setQuote({ ...quote, items: quote.items.filter((candidate) => candidate.id !== item.id) })}>
                      <Trash2 size={16} />
                    </ActionButton>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <label className="sm:col-span-1">
                    <span className="mb-2 block text-sm font-black text-clay">פריט</span>
                    <select
                      className="input"
                      value={item.productId}
                      onChange={(event) => {
                        const product = data.products.find((candidate) => candidate.id === event.target.value);
                        updateItem(item.id, {
                          productId: event.target.value,
                          pricePerParticipantIncVat: product?.recommendedParticipantPriceIncVat ?? item.pricePerParticipantIncVat,
                          unitCostExVat: product?.averageUnitCostExVat ?? item.unitCostExVat
                        });
                      }}
                    >
                      {data.products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="כמות" value={item.quantity} onChange={(value) => updateItem(item.id, { quantity: value })} />
                  <Field label="מחיר כולל מע״מ" value={item.pricePerParticipantIncVat} onChange={(value) => updateItem(item.id, { pricePerParticipantIncVat: value })} />
                  <Field label="עלות לפני מע״מ" value={item.unitCostExVat} onChange={(value) => updateItem(item.id, { unitCostExVat: value })} />
                </div>
                <p className="mt-3 text-sm font-black text-clay">
                  שורת הכנסה: {formatCurrency(item.quantity * item.pricePerParticipantIncVat)} · עלות קרמיקה: {formatCurrency(item.quantity * item.unitCostExVat)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-black text-clay">עובדת</span>
              <select
                className="input"
                value={quote.employeeId}
                onChange={(event) => {
                  const employee = data.employees.find((item) => item.id === event.target.value);
                  setQuote({ ...quote, employeeId: event.target.value, employeeHourlyRate: employee?.hourlyRate ?? quote.employeeHourlyRate });
                }}
              >
                <option value="">ללא עובדת</option>
                {data.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
            <Field label="שעות עובדת" value={quote.employeeHours} onChange={(value) => setQuote({ ...quote, employeeHours: value })} />
            <Field label="עלות שעת עובדת" value={quote.employeeHourlyRate} onChange={(value) => setQuote({ ...quote, employeeHourlyRate: value })} />
            <Field label="עלות צבעים" value={quote.paintCost} onChange={(value) => setQuote({ ...quote, paintCost: value })} />
            <Field label="עלות גלזורה" value={quote.glazeCost} onChange={(value) => setQuote({ ...quote, glazeCost: value })} />
            <Field label="עלות אריזה" value={quote.packagingCost} onChange={(value) => setQuote({ ...quote, packagingCost: value })} />
            <Field label="עלות שריפה" value={quote.firingCost} onChange={(value) => setQuote({ ...quote, firingCost: value })} />
            <Field label="עלות לוגיסטיקה" value={quote.logisticsCost} onChange={(value) => setQuote({ ...quote, logisticsCost: value })} />
          </div>

          <div className="mt-6 flex gap-2">
            <ActionButton type="submit">
              <span className="inline-flex items-center gap-2">
                <Plus size={18} />
                {quote.id ? "שמירת הצעה" : "יצירת הצעה"}
              </span>
            </ActionButton>
            {onDone ? (
              <ActionButton tone="quiet" onClick={onDone}>
                ביטול
              </ActionButton>
            ) : null}
          </div>
        </form>
      </Card>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <Card className="space-y-4 bg-paper">
          <div>
            <p className="text-sm font-black text-clay">סיכום חי</p>
            <h3 className="text-2xl font-black text-ink">כמה נשאר באמת</h3>
          </div>
          <SummaryRow label="סה״כ ללקוח כולל מע״מ" value={formatCurrency(pricing.revenueIncVat)} />
          <SummaryRow label="לפני מע״מ" value={formatCurrency(pricing.revenueExVat)} />
          <SummaryRow label="עלות קרמיקה" value={formatCurrency(pricing.ceramicCost)} />
          <SummaryRow label="עלות עובדת" value={formatCurrency(pricing.employeeCost)} />
          <SummaryRow label="מה יורד מהאירוע" value={formatCurrency(pricing.directCosts)} />
          <div className="rounded-3xl bg-mint/70 p-4">
            <SummaryRow label="נשאר לפני מסים ושאר הוצאות" value={formatCurrency(pricing.grossProfit)} strong />
            <SummaryRow label="כמה אוויר נשאר" value={formatPercent(pricing.margin)} strong />
          </div>
          <p className="rounded-3xl bg-peach/60 p-4 font-bold leading-7 text-ink">{pricing.recommendation}</p>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      <input className="input" type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "font-black text-ink" : "font-bold text-clay"}`}>
      <span>{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  );
}
