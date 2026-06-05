import { Download, PackageCheck } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { inventory, products, supplierProducts } from "@/lib/data";
import { formatCurrency } from "@/lib/pricing";

export default function InventoryPage() {
  return (
    <>
      <PageHeader title="מלאי" description="כמה יש על המדף, כמה שמור לאירועים, ומה כדאי לבדוק מול ספקים." />
      <div className="grid gap-4 lg:grid-cols-2">
        {inventory.map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);
          const available = item.quantityOnHand - item.quantityReserved;
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-ink">{product?.name}</h2>
                  <p className="mt-1 font-bold text-clay">עלות ממוצעת {formatCurrency(item.averageUnitCostExVat)} ללא מע״מ</p>
                </div>
                <PackageCheck className="text-coral" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Mini label="במלאי" value={item.quantityOnHand} />
                <Mini label="שמור" value={item.quantityReserved} />
                <Mini label="פנוי" value={available} />
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand">
                <div className="h-full rounded-full bg-coral" style={{ width: `${Math.min(100, (available / item.quantityOnHand) * 100)}%` }} />
              </div>
              {available <= item.reorderThreshold ? <p className="mt-3 font-black text-coral">כדאי לבדוק הזמנה מחדש</p> : null}
            </Card>
          );
        })}
      </div>

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
              {supplierProducts.map((item) => (
                <tr key={item.id} className="border-t border-clay/10 font-bold text-ink">
                  <td className="py-3">{item.supplierName}</td>
                  <td>{item.supplierProductName}</td>
                  <td>{item.supplierCategory}</td>
                  <td>{formatCurrency(item.priceIncVat)}</td>
                  <td>{products.find((product) => product.id === item.matchedProductId)?.name ?? "לא מותאם"}</td>
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
