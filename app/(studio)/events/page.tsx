"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { eventTypeLabels, statusLabels } from "@/lib/seedData";
import { calculateEventPricing, formatCurrency } from "@/lib/pricing";
import { createId, useStudioData } from "@/lib/storage";
import type { Event, EventItem, EventStatus, EventType } from "@/lib/types";

const eventStatuses = Object.keys(statusLabels) as EventStatus[];
const eventTypes = Object.keys(eventTypeLabels) as EventType[];

function createEventItem(productId: string, quantity: number, pricePerItemIncVat: number, unitCostExVat: number): EventItem {
  return {
    id: createId("event_item"),
    productId,
    quantity,
    pricePerItemIncVat,
    unitCostExVat
  };
}

function createEmptyEvent(clientId = "", product?: { id: string; recommendedParticipantPriceIncVat: number; averageUnitCostExVat: number }): Event {
  return {
    id: "",
    title: "",
    clientId,
    contactName: "",
    contactPhone: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "10:00",
    endTime: "14:00",
    address: "",
    hasTables: true,
    hasChairs: true,
    participantCount: 20,
    eventType: "company",
    customEventType: "",
    eventDescription: "",
    status: "lead",
    items: [createEventItem(product?.id ?? "", 20, product?.recommendedParticipantPriceIncVat ?? 100, product?.averageUnitCostExVat ?? 0)],
    eventHours: 4,
    assignments: [],
    expenses: { paintCost: 0, glazeCost: 0, packagingCost: 0, firingCost: 0, logisticsCost: 0, arrivalCost: 0, deliveryCost: 0 },
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
      const productNames = event.items.map((line) => data.products.find((item) => item.id === line.productId)?.name ?? "").join(" ");
      const matchesQuery =
        !value ||
        [event.title, event.contactName, event.contactPhone, event.address, event.eventDescription, client?.name ?? "", productNames].some((field) =>
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
      ...createEmptyEvent(client?.id ?? "", product),
      contactName: client?.contactName ?? "",
      contactPhone: client?.phone ?? ""
    });
    setIsFormOpen(true);
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const cleanEvent = {
      ...form,
      items: form.items.length ? form.items : [createBlankItem()]
    };

    if (form.id) updateEvent(cleanEvent);
    else addEvent({ ...cleanEvent, id: createId("event") });

    setIsFormOpen(false);
    setForm(createEmptyEvent());
  }

  function createBlankItem(quantity = form.participantCount) {
    const product = data.products.find((item) => item.isActive) ?? data.products[0];
    return createEventItem(product?.id ?? "", quantity, product?.recommendedParticipantPriceIncVat ?? 100, product?.averageUnitCostExVat ?? 0);
  }

  function updateItem(itemId: string, patch: Partial<EventItem>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    }));
  }

  function toggleEmployee(employeeId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      assignments: checked
        ? [...current.assignments, { employeeId, eventHours: current.eventHours }]
        : current.assignments.filter((assignment) => assignment.employeeId !== employeeId)
    }));
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
            <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש אירוע, איש קשר, פריט או כתובת" />
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
            <Input label="כמות משתתפים" type="number" value={String(form.participantCount)} onChange={(value) => setForm({ ...form, participantCount: Number(value) })} />
            <Input label="איש קשר סדנה" value={form.contactName} onChange={(value) => setForm({ ...form, contactName: value })} />
            <Input label="טלפון איש קשר" value={form.contactPhone} onChange={(value) => setForm({ ...form, contactPhone: value })} />
            <label>
              <span className="mb-2 block text-sm font-black text-clay">לקוח / חברה</span>
              <select
                className="input"
                value={form.clientId}
                onChange={(event) => {
                  const client = data.clients.find((item) => item.id === event.target.value);
                  setForm({ ...form, clientId: event.target.value, contactName: client?.contactName ?? form.contactName, contactPhone: client?.phone ?? form.contactPhone });
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
            <Input label="תיאור קצר / סוג חופשי" value={form.customEventType} onChange={(value) => setForm({ ...form, customEventType: value })} />
            <Input label="תאריך" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
            <Input label="שעת התחלה" type="time" value={form.startTime} onChange={(value) => setForm({ ...form, startTime: value })} />
            <Input label="שעת סיום" type="time" value={form.endTime} onChange={(value) => setForm({ ...form, endTime: value })} />
            <Input label="כתובת" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
            <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
              <Check label="יש שולחנות" checked={form.hasTables} onChange={(value) => setForm({ ...form, hasTables: value })} />
              <Check label="יש כיסאות" checked={form.hasChairs} onChange={(value) => setForm({ ...form, hasChairs: value })} />
            </div>

            <section className="md:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-ink">פריטים לאירוע</h2>
                <ActionButton tone="quiet" onClick={() => setForm({ ...form, items: [...form.items, createBlankItem()] })}>
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} />
                    הוספת פריט
                  </span>
                </ActionButton>
              </div>
              <div className="space-y-3">
                {form.items.map((item, index) => (
                  <div key={item.id} className="rounded-3xl bg-white/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="font-black text-clay">פריט {index + 1}</p>
                      {form.items.length > 1 ? (
                        <ActionButton tone="danger" onClick={() => setForm({ ...form, items: form.items.filter((candidate) => candidate.id !== item.id) })}>
                          <Trash2 size={16} />
                        </ActionButton>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                      <label>
                        <span className="mb-2 block text-sm font-black text-clay">פריט</span>
                        <select
                          className="input"
                          value={item.productId}
                          onChange={(change) => {
                            const product = data.products.find((candidate) => candidate.id === change.target.value);
                            updateItem(item.id, {
                              productId: change.target.value,
                              pricePerItemIncVat: product?.recommendedParticipantPriceIncVat ?? item.pricePerItemIncVat,
                              unitCostExVat: product?.averageUnitCostExVat ?? item.unitCostExVat
                            });
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
                      <NumberInput label="כמות לאירוע" value={item.quantity} onChange={(value) => updateItem(item.id, { quantity: value })} />
                      <NumberInput label="מחיר לכלי ללקוח" value={item.pricePerItemIncVat} onChange={(value) => updateItem(item.id, { pricePerItemIncVat: value })} />
                      <NumberInput label="עלות כלי" value={item.unitCostExVat} onChange={(value) => updateItem(item.id, { unitCostExVat: value })} />
                    </div>
                    <p className="mt-3 text-sm font-black text-clay">
                      הכנסה מהשורה: {formatCurrency(item.quantity * item.pricePerItemIncVat)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-3 md:col-span-2">
              <h2 className="text-xl font-black text-ink">מי מגיעה לסדנה?</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {data.employees.map((employee) => (
                  <Check
                    key={employee.id}
                    label={employee.name}
                    checked={form.assignments.some((assignment) => assignment.employeeId === employee.id)}
                    onChange={(checked) => toggleEmployee(employee.id, checked)}
                  />
                ))}
              </div>
              <NumberInput
                label="שעות לכל עובדת שנבחרה"
                value={form.eventHours}
                onChange={(value) =>
                  setForm({
                    ...form,
                    eventHours: value,
                    assignments: form.assignments.map((assignment) => ({ ...assignment, eventHours: value }))
                  })
                }
              />
            </section>

            <section className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <NumberInput label="חיוב הגעה ללקוח" value={form.expenses.arrivalCost ?? 0} onChange={(value) => setForm({ ...form, expenses: { ...form.expenses, arrivalCost: value } })} />
              <NumberInput label="חיוב משלוח ללקוח" value={form.expenses.deliveryCost ?? 0} onChange={(value) => setForm({ ...form, expenses: { ...form.expenses, deliveryCost: value } })} />
            </section>

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
            const total =
              event.items.reduce((sum, item) => sum + item.quantity * item.pricePerItemIncVat, 0) +
              (event.expenses.arrivalCost ?? 0) +
              (event.expenses.deliveryCost ?? 0);
            const productNames = event.items.map((line) => data.products.find((item) => item.id === line.productId)?.name ?? "פריט לא נבחר").join(", ");
            const pricing = calculateEventPricing(event, data.employees, data.businessSettings.vatRate);

            return (
              <Card key={event.id}>
                <div className="grid gap-4 lg:grid-cols-[1fr_190px_150px] lg:items-center">
                  <div>
                    <h2 className="text-2xl font-black text-ink">{event.title}</h2>
                    <p className="mt-1 font-bold text-clay">
                      {event.contactName || client?.contactName || "ללא איש קשר"} · {event.contactPhone || client?.phone || "ללא טלפון"} · {event.date}
                    </p>
                    <p className="mt-2 text-sm font-bold text-clay">
                      {event.participantCount} משתתפים · {productNames || "ללא פריטים"} · {formatCurrency(total)}
                    </p>
                    <p className="mt-1 text-sm font-bold text-clay">נשאר לפני מסים: {formatCurrency(pricing.grossProfit)}</p>
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

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      <input className="input" type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} />
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
