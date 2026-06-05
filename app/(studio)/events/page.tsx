"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { eventTypeLabels, statusLabels } from "@/lib/seedData";
import { createId, useStudioData } from "@/lib/storage";
import type { Event, EventStatus, EventType } from "@/lib/types";
import { formatCurrency } from "@/lib/pricing";

const eventStatuses = Object.keys(statusLabels) as EventStatus[];
const eventTypes = Object.keys(eventTypeLabels) as EventType[];

function createEmptyEvent(clientId = "", productId = ""): Event {
  return {
    id: "",
    title: "",
    clientId,
    contactName: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "10:00",
    endTime: "14:00",
    address: "",
    hasTables: true,
    hasChairs: true,
    hasWater: true,
    participantCount: 20,
    eventType: "company",
    customEventType: "",
    eventDescription: "",
    status: "lead",
    productId,
    participantPriceIncVat: 100,
    eventHours: 4,
    assignments: [],
    expenses: { paintCost: 120, glazeCost: 90, packagingCost: 80, firingCost: 160, logisticsCost: 220 },
    internalNotes: ""
  };
}

export default function EventsPage() {
  const { data, addEvent, updateEvent, deleteEvent } = useStudioData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [form, setForm] = useState<Event>(() => createEmptyEvent());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    const value = query.trim().toLowerCase();
    return data.events.filter((event) => {
      const client = data.clients.find((item) => item.id === event.clientId);
      const product = data.products.find((item) => item.id === event.productId);
      const matchesQuery =
        !value ||
        [event.title, event.contactName, event.address, event.eventDescription, client?.name ?? "", product?.name ?? ""].some((field) =>
          field.toLowerCase().includes(value)
        );
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [data.clients, data.events, data.products, query, statusFilter]);

  function openNewForm() {
    const product = data.products.find((item) => item.isActive) ?? data.products[0];
    const client = data.clients[0];
    setForm({
      ...createEmptyEvent(client?.id ?? "", product?.id ?? ""),
      contactName: client?.contactName ?? "",
      participantPriceIncVat: product?.recommendedParticipantPriceIncVat ?? 100
    });
    setIsFormOpen(true);
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    if (form.id) updateEvent(form);
    else addEvent({ ...form, id: createId("event") });

    setIsFormOpen(false);
    setForm(createEmptyEvent());
  }

  return (
    <>
      <PageHeader
        title="אירועים"
        description="אירועים חיים שאפשר להוסיף, לערוך, למחוק ולשנות להם סטטוס."
        action={
          <ActionButton onClick={openNewForm}>
            <span className="inline-flex items-center gap-2">
              <Plus size={17} />
              אירוע חדש
            </span>
          </ActionButton>
        }
      />

      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <label className="flex items-center gap-3">
            <Search className="text-coral" size={20} />
            <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש אירוע, לקוח, פריט או כתובת" />
          </label>
          <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as EventStatus | "all")}>
            <option value="all">כל הסטטוסים</option>
            {eventStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {isFormOpen ? (
        <Card className="mb-5">
          <form onSubmit={submitEvent} className="grid gap-4 md:grid-cols-2">
            <Input label="שם האירוע" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
            <label>
              <span className="mb-2 block text-sm font-black text-clay">סוג אירוע</span>
              <select className="input" value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value as EventType })}>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {eventTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <Input label="תיאור חופשי של האירוע" value={form.customEventType} onChange={(value) => setForm({ ...form, customEventType: value })} />
            <label>
              <span className="mb-2 block text-sm font-black text-clay">לקוח</span>
              <select
                className="input"
                value={form.clientId}
                onChange={(event) => {
                  const client = data.clients.find((item) => item.id === event.target.value);
                  setForm({ ...form, clientId: event.target.value, contactName: client?.contactName ?? form.contactName });
                }}
              >
                <option value="">ללא לקוח</option>
                {data.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <Input label="איש קשר" value={form.contactName} onChange={(value) => setForm({ ...form, contactName: value })} />
            <Input label="תאריך" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
            <Input label="שעת התחלה" type="time" value={form.startTime} onChange={(value) => setForm({ ...form, startTime: value })} />
            <Input label="שעת סיום" type="time" value={form.endTime} onChange={(value) => setForm({ ...form, endTime: value })} />
            <Input label="כתובת" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
            <div className="grid gap-3 sm:grid-cols-3 md:col-span-2">
              <Check label="יש שולחנות" checked={form.hasTables} onChange={(value) => setForm({ ...form, hasTables: value })} />
              <Check label="יש כיסאות" checked={form.hasChairs} onChange={(value) => setForm({ ...form, hasChairs: value })} />
              <Check label="יש מקור מים" checked={form.hasWater} onChange={(value) => setForm({ ...form, hasWater: value })} />
            </div>
            <Input label="כמות משתתפים" type="number" value={String(form.participantCount)} onChange={(value) => setForm({ ...form, participantCount: Number(value) })} />
            <label>
              <span className="mb-2 block text-sm font-black text-clay">פריט</span>
              <select
                className="input"
                value={form.productId}
                onChange={(event) => {
                  const product = data.products.find((item) => item.id === event.target.value);
                  setForm({ ...form, productId: event.target.value, participantPriceIncVat: product?.recommendedParticipantPriceIncVat ?? form.participantPriceIncVat });
                }}
              >
                <option value="">ללא פריט</option>
                {data.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <Input label="מחיר למשתתף" type="number" value={String(form.participantPriceIncVat)} onChange={(value) => setForm({ ...form, participantPriceIncVat: Number(value) })} />
            <label>
              <span className="mb-2 block text-sm font-black text-clay">סטטוס</span>
              <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EventStatus })}>
                {eventStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-black text-clay">תיאור חופשי מלא</span>
              <textarea className="input min-h-24" value={form.eventDescription} onChange={(event) => setForm({ ...form, eventDescription: event.target.value })} />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-black text-clay">הערות פנימיות</span>
              <textarea className="input min-h-24" value={form.internalNotes} onChange={(event) => setForm({ ...form, internalNotes: event.target.value })} />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <ActionButton type="submit">{form.id ? "שמירת אירוע" : "הוספת אירוע"}</ActionButton>
              <ActionButton tone="quiet" onClick={() => setIsFormOpen(false)}>
                ביטול
              </ActionButton>
            </div>
          </form>
        </Card>
      ) : null}

      {filteredEvents.length ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const client = data.clients.find((item) => item.id === event.clientId);
            const product = data.products.find((item) => item.id === event.productId);
            const total = event.participantCount * event.participantPriceIncVat;

            return (
              <Card key={event.id}>
                <div className="grid gap-4 lg:grid-cols-[1fr_190px_150px] lg:items-center">
                  <div>
                    <h2 className="text-2xl font-black text-ink">{event.title}</h2>
                    <p className="mt-1 font-bold text-clay">
                      {client?.name || "ללא לקוח"} · {event.date} · {event.startTime}
                    </p>
                    <p className="mt-2 text-sm font-bold text-clay">
                      {event.participantCount} משתתפים · {product?.name || "ללא פריט"} · {formatCurrency(total)}
                    </p>
                  </div>
                  <select className="input" value={event.status} onChange={(change) => updateEvent({ ...event, status: change.target.value as EventStatus })}>
                    {eventStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 lg:justify-end">
                    <ActionButton tone="quiet" onClick={() => { setForm(event); setIsFormOpen(true); }}>
                      <Edit3 size={16} />
                    </ActionButton>
                    <ActionButton tone="danger" onClick={() => window.confirm("למחוק את האירוע?") && deleteEvent(event.id)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </div>
                </div>
                <div className="mt-4">
                  <StatusBadge status={event.status} />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="עוד אין אירועים" body="עוד אין אירועים. בואי נוסיף את הסדנה הראשונה." />
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

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-3xl bg-white/60 p-4 font-black text-clay">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
