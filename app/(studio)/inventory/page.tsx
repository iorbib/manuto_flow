"use client";

import Link from "next/link";
import { AlertTriangle, Download, PackageCheck, PackageSearch, Save } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/pricing";
import { createId, useStudioData } from "@/lib/storage";
import type { Event, InventoryItem, Product } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryPage() {
  const { data, updateInventoryItem } = useStudioData();
  const today = new Date().toISOString().slice(0, 10);
  const activeProducts = data.products.filter((product) => product.isActive);
  const vatMultiplier = 1 + data.businessSettings.vatRate;

  const inventoryRows = activeProducts
    .map((product) => {
      const inventory = data.inventory.find((item) => item.productId === product.id) ?? createInventoryItem(product);
      const reservationEvents = getReservationEvents(data.events, product.id, today);
      const reservedQuantity = reservationEvents.reduce((sum, event) => sum + event.quantity, 0);
      const availableQuantity = inventory.quantityOnHand - reservedQuantity;

      return {
        product,
        inventory,
        reservationEvents,
        reservedQuantity,
        availableQuantity,
        isLow: availableQuantity < LOW_STOCK_THRESHOLD
      };
    })
    .sort((first, second) => {
      if (first.isLow !== second.isLow) return first.isLow ? -1 : 1;
      if (first.reservedQuantity !== second.reservedQuantity) return second.reservedQuantity - first.reservedQuantity;
      return first.product.name.localeCompare(second.product.name, "he");
    });

  const lowStockCount = inventoryRows.filter((row) => row.isLow).length;
  const reservedCount = inventoryRows.reduce((sum, row) => sum + row.reservedQuantity, 0);

  function saveInventoryPatch(item: InventoryItem, patch: Partial<InventoryItem>) {
    updateInventoryItem({
      ...item,
      ...patch,
      quantityReserved: 0,
      reorderThreshold: LOW_STOCK_THRESHOLD
    });
  }

  return (
    <>
      <PageHeader
        title="מלאי"
        description="כל פריט פעיל מופיע כאן. המלאי שעל המדף נערך ידנית, והכלים השמורים מחושבים אוטומטית מהאירועים הקרובים."
        action={
          <Link href="/products">
            <ActionButton>עריכת פריטים</ActionButton>
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Mini label="פריטים פעילים" value={activeProducts.length} />
        <Mini label="צריך תשומת לב" value={lowStockCount} tone="text-coral" />
        <Mini label="כלים שמורים" value={reservedCount} />
      </div>

      {inventoryRows.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {inventoryRows.map(({ product, inventory, reservationEvents, reservedQuantity, availableQuantity, isLow }) => (
            <Card key={product.id} className={isLow ? "border-2 border-coral/45" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl bg-peach/45">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-xs font-black text-clay">תמונה</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-ink">{product.name}</h2>
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-coral/15 px-3 py-1 text-xs font-black text-coral">
                          <AlertTriangle size={15} />
                          מלאי נמוך
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-bold text-clay">{product.type || "ללא סוג"}</p>
                    <p className="mt-1 text-sm font-bold text-clay">מחירון לקוח {formatCurrency(product.recommendedParticipantPriceIncVat)} כולל מע״מ</p>
                  </div>
                </div>
                <PackageCheck className="shrink-0 text-coral" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Mini label="במלאי" value={inventory.quantityOnHand} />
                <Mini label="שמור" value={reservedQuantity} />
                <Mini label="פנוי" value={availableQuantity} tone={isLow ? "text-coral" : "text-ink"} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-clay">
                  כמות במלאי
                  <input
                    type="number"
                    min="0"
                    value={inventory.quantityOnHand}
                    onChange={(event) => saveInventoryPatch(inventory, { quantityOnHand: Number(event.target.value) || 0 })}
                    className="rounded-3xl border border-clay/15 bg-white/80 px-4 py-3 text-lg font-black text-ink outline-none focus:border-coral"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black text-clay">
                  עלות ממוצעת כולל מע״מ
                  <input
                    type="number"
                    min="0"
                    value={roundMoney(inventory.averageUnitCostExVat * vatMultiplier)}
                    onChange={(event) => saveInventoryPatch(inventory, { averageUnitCostExVat: roundMoney((Number(event.target.value) || 0) / vatMultiplier) })}
                    className="rounded-3xl border border-clay/15 bg-white/80 px-4 py-3 text-lg font-black text-ink outline-none focus:border-coral"
                  />
                </label>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand">
                <div
                  className={`h-full rounded-full ${isLow ? "bg-coral" : "bg-mint"}`}
                  style={{ width: `${inventory.quantityOnHand ? Math.max(0, Math.min(100, (availableQuantity / inventory.quantityOnHand) * 100)) : 0}%` }}
                />
              </div>

              {reservationEvents.length ? (
                <div className="mt-5 rounded-3xl bg-white/60 p-4">
                  <div className="mb-3 flex items-center gap-2 font-black text-ink">
                    <PackageSearch size={18} className="text-coral" />
                    כלים שמורים לאירועים קרובים
                  </div>
                  <div className="space-y-2">
                    {reservationEvents.map((event) => (
                      <div key={`${product.id}-${event.eventId}`} className="flex items-center justify-between gap-3 rounded-2xl bg-peach/35 px-3 py-2 text-sm font-bold text-clay">
                        <span className="min-w-0 truncate">
                          {event.date} · {event.title}
                        </span>
                        <span className="shrink-0 text-ink">{event.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 font-bold text-clay">אין כרגע כלים שמורים מהאירועים הקרובים.</p>
              )}

              <div className="mt-4 flex items-center gap-2 text-sm font-black text-clay">
                <Save size={16} />
                נשמר אוטומטית לענן אחרי כל שינוי
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="אין פריטים פעילים במלאי" body="כדי להתחיל, הוסיפי פריט פעיל במסך פריטים והוא יופיע כאן אוטומטית." />
      )}

      <Card className="mt-5">
        <div className="mb-4 flex items-center gap-3">
          <Download className="text-coral" />
          <h2 className="text-2xl font-black text-ink">קטלוג ספקים</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right">
            <thead className="text-sm text-clay">
              <tr>
                <th className="py-3">ספק</th>
                <th>מוצר ספק</th>
                <th>קטגוריה</th>
                <th>מחיר כולל מע״מ</th>
                <th>מותאם למוצר</th>
                <th>נבדק לאחרונה</th>
              </tr>
            </thead>
            <tbody>
              {data.supplierProducts.map((item) => (
                <tr key={item.id} className="border-t border-clay/10 font-bold text-ink">
                  <td className="py-3">{item.supplierName}</td>
                  <td>{item.supplierProductName}</td>
                  <td>{item.supplierCategory}</td>
                  <td>{formatCurrency(item.priceIncVat)}</td>
                  <td>{data.products.find((product) => product.id === item.matchedProductId)?.name ?? "לא מותאם"}</td>
                  <td>{item.lastCheckedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function roundMoney(value: number) {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

function createInventoryItem(product: Product): InventoryItem {
  return {
    id: createId("inventory"),
    productId: product.id,
    quantityOnHand: 0,
    quantityReserved: 0,
    reorderThreshold: LOW_STOCK_THRESHOLD,
    averageUnitCostExVat: product.averageUnitCostExVat
  };
}

function getReservationEvents(events: Event[], productId: string, today: string) {
  return events
    .filter((event) => event.date >= today && !["cancelled", "delivered", "paid", "closed"].includes(event.status))
    .map((event) => ({
      eventId: event.id,
      title: event.title,
      date: event.date,
      quantity: (event.items ?? []).filter((item) => item.productId === productId).reduce((sum, item) => sum + item.quantity, 0)
    }))
    .filter((event) => event.quantity > 0)
    .sort((first, second) => first.date.localeCompare(second.date));
}

function Mini({ label, value, tone = "text-ink" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-3xl bg-white/60 p-4 text-center">
      <p className="text-sm font-black text-clay">{label}</p>
      <p className={`mt-1 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}
