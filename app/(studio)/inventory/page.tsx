"use client";

import Link from "next/link";
import { Download, PackageCheck } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/pricing";
import { useStudioData } from "@/lib/storage";

export default function InventoryPage() {
  const { data } = useStudioData();

  return (
    <>
      <PageHeader
        title="מלאי"
        description="מבט מלאי מתוך הנתונים השמורים. את קטלוג הפריטים עורכים במסך פריטים."
        action={
          <Link href="/products">
            <ActionButton>עריכת פריטים</ActionButton>
          </Link>
        }
      />
      {data.inventory.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.inventory.map((item) => {
            const product = data.products.find((candidate) => candidate.id === item.productId);
            const available = item.quantityOnHand - item.quantityReserved;
            return (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl bg-peach/45">
                      {product?.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-xs font-black text-clay">תמונה</span>}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-ink">{product?.name || "פריט שנמחק"}</h2>
                      <p className="mt-1 font-bold text-clay">עלות ממוצעת {formatCurrency(item.averageUnitCostExVat)} ללא מע״מ</p>
                    </div>
                  </div>
                  <PackageCheck className="text-coral" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <Mini label="במלאי" value={item.quantityOnHand} />
                  <Mini label="שמור" value={item.quantityReserved} />
                  <Mini label="פנוי" value={available} />
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-coral" style={{ width: `${item.quantityOnHand ? Math.min(100, (available / item.quantityOnHand) * 100) : 0}%` }} />
                </div>
                {available <= item.reorderThreshold ? <p className="mt-3 font-black text-coral">כדאי לבדוק הזמנה מחדש</p> : null}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="אין מלאי להצגה" body="בשלב הבא נוסיף ניהול תנועות מלאי מלא. כרגע הפריטים עצמם נערכים בקטלוג." />
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

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white/60 p-4 text-center">
      <p className="text-sm font-black text-clay">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}
