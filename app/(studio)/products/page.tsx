"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/pricing";
import { createId, useStudioData } from "@/lib/storage";
import type { Product } from "@/lib/types";

const emptyProduct: Product = {
  id: "",
  name: "",
  type: "",
  averageUnitCostExVat: 0,
  recommendedParticipantPriceIncVat: 100,
  supplierName: "",
  supplierUrl: "",
  imageUrl: "",
  isActive: true
};

export default function ProductsPage() {
  const { data, addProduct, updateProduct, deleteProduct } = useStudioData();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Product>(emptyProduct);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const products = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return data.products;
    return data.products.filter((product) => [product.name, product.type, product.supplierName].some((field) => field.toLowerCase().includes(value)));
  }, [data.products, query]);

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;

    if (form.id) updateProduct(form);
    else addProduct({ ...form, id: createId("prod") });

    setForm(emptyProduct);
    setIsFormOpen(false);
  }

  return (
    <>
      <PageHeader
        title="פריטים"
        description="קטלוג הפריטים שאפשר לשבץ באירועים ובהצעות מחיר."
        action={
          <ActionButton
            onClick={() => {
              setForm(emptyProduct);
              setIsFormOpen(true);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={17} />
              פריט חדש
            </span>
          </ActionButton>
        }
      />

      <Card className="mb-5">
        <label className="flex items-center gap-3">
          <Search className="text-coral" size={20} />
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש פריט או ספק" />
        </label>
      </Card>

      {isFormOpen ? (
        <Card className="mb-5">
          <form onSubmit={submitProduct} className="grid gap-4 md:grid-cols-2">
            <Input label="שם פריט" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Input label="סוג" value={form.type} onChange={(value) => setForm({ ...form, type: value })} />
            <Input label="עלות ממוצעת לפני מע״מ" type="number" value={String(form.averageUnitCostExVat)} onChange={(value) => setForm({ ...form, averageUnitCostExVat: Number(value) })} />
            <Input label="מחיר מומלץ למשתתף כולל מע״מ" type="number" value={String(form.recommendedParticipantPriceIncVat)} onChange={(value) => setForm({ ...form, recommendedParticipantPriceIncVat: Number(value) })} />
            <Input label="ספק" value={form.supplierName} onChange={(value) => setForm({ ...form, supplierName: value })} />
            <Input label="קישור ספק" value={form.supplierUrl} onChange={(value) => setForm({ ...form, supplierUrl: value })} />
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-black text-clay">תמונה של הפריט</span>
              <div className="grid gap-3 rounded-3xl bg-white/60 p-4 sm:grid-cols-[140px_1fr] sm:items-center">
                <div className="grid aspect-square place-items-center overflow-hidden rounded-3xl bg-peach/40">
                  {form.imageUrl ? <img src={form.imageUrl} alt={form.name || "תמונת פריט"} className="h-full w-full object-cover" /> : <span className="text-sm font-black text-clay">אין תמונה</span>}
                </div>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setForm((current) => ({ ...current, imageUrl: String(reader.result) }));
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-3xl bg-white/60 p-4 font-black text-clay">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
              פעיל
            </label>
            <div className="flex gap-2 md:col-span-2">
              <ActionButton type="submit">{form.id ? "שמירת שינוי" : "הוספת פריט"}</ActionButton>
              <ActionButton tone="quiet" onClick={() => setIsFormOpen(false)}>
                ביטול
              </ActionButton>
            </div>
          </form>
        </Card>
      ) : null}

      {products.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl bg-peach/45">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-xs font-black text-clay">תמונה</span>}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-ink">{product.name}</h2>
                  <p className="mt-1 font-bold text-clay">{product.type || "ללא סוג"}</p>
                </div>
                <div className="flex gap-2">
                  <ActionButton tone="quiet" onClick={() => { setForm(product); setIsFormOpen(true); }}>
                    <Edit3 size={16} />
                  </ActionButton>
                  <ActionButton tone="danger" onClick={() => window.confirm("למחוק את הפריט?") && deleteProduct(product.id)}>
                    <Trash2 size={16} />
                  </ActionButton>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Mini label="עלות לפני מע״מ" value={formatCurrency(product.averageUnitCostExVat)} />
                <Mini label="מחיר מומלץ" value={formatCurrency(product.recommendedParticipantPriceIncVat)} />
              </div>
              <p className="mt-4 font-bold text-clay">ספק: {product.supplierName || "לא הוגדר"}</p>
              {product.supplierUrl ? (
                <a className="mt-2 block break-all font-bold text-coral" href={product.supplierUrl} target="_blank" rel="noreferrer">
                  {product.supplierUrl}
                </a>
              ) : null}
              <p className={`mt-3 font-black ${product.isActive ? "text-emerald-700" : "text-red-800"}`}>{product.isActive ? "פעיל" : "לא פעיל"}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="אין פריטים להצגה" body="אפשר להוסיף פריט ראשון ואז להשתמש בו באירועים ובהצעות." />
      )}
    </>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      <input className="input" type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
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
