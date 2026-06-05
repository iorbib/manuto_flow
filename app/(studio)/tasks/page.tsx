"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Camera, Flame, Package, Sparkles, Truck, Trash2 } from "lucide-react";
import { studioToolFlow, studioToolStatusColors, studioToolStatusLabels } from "@/lib/seedData";
import { createId, useStudioData } from "@/lib/storage";
import type { Event, StudioToolPhoto, StudioToolStatus } from "@/lib/types";
import { ActionButton, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";

const exceptionStatuses: StudioToolStatus[] = ["follow_up", "compensation", "broken", "missing"];

type UploadForm = {
  productName: string;
  quantity: number;
  note: string;
  status: StudioToolStatus;
};

const defaultUploadForm: UploadForm = {
  productName: "כלי",
  quantity: 1,
  note: "",
  status: "photographed"
};

const KILN_CAPACITY_KEY = "manuto-flow-kiln-capacity";

export default function TasksPage() {
  const { data, addStudioToolPhoto, updateStudioToolPhoto, deleteStudioToolPhoto } = useStudioData();
  const [selectedEventId, setSelectedEventId] = useState("");
  const [kilnCapacity, setKilnCapacity] = useState(40);
  const [uploadForm, setUploadForm] = useState<UploadForm>(defaultUploadForm);

  const workshopEvents = useMemo(() => getWorkshopEvents(data.events, data.studioToolPhotos), [data.events, data.studioToolPhotos]);
  const selectedEvent = workshopEvents.find((event) => event.id === selectedEventId) ?? workshopEvents[0];
  const selectedPhotos = data.studioToolPhotos.filter((photo) => photo.eventId === selectedEvent?.id);
  const selectedProductNames = useMemo(() => (selectedEvent ? getEventProductNames(selectedEvent, data.products) : []), [data.products, selectedEvent]);
  const uploadProductOptions = useMemo(() => Array.from(new Set([...selectedProductNames, "כלי", "קבוצת כלים"])), [selectedProductNames]);
  const studioLoad = useMemo(() => calculateStudioLoad(data.studioToolPhotos, kilnCapacity), [data.studioToolPhotos, kilnCapacity]);
  const selectedDeadline = selectedEvent ? getStudioDeadline(selectedEvent.date) : null;

  useEffect(() => {
    const eventIdFromUrl = new URLSearchParams(window.location.search).get("eventId");
    const nextEventId = eventIdFromUrl && workshopEvents.some((event) => event.id === eventIdFromUrl) ? eventIdFromUrl : workshopEvents[0]?.id ?? "";
    setSelectedEventId((current) => current || nextEventId);
  }, [workshopEvents]);

  useEffect(() => {
    const storedCapacity = Number(window.localStorage.getItem(KILN_CAPACITY_KEY));
    if (storedCapacity > 0) {
      setKilnCapacity(storedCapacity);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(KILN_CAPACITY_KEY, String(kilnCapacity));
  }, [kilnCapacity]);

  useEffect(() => {
    if (selectedProductNames.length && !selectedProductNames.includes(uploadForm.productName)) {
      setUploadForm((current) => ({ ...current, productName: selectedProductNames[0] }));
    }
  }, [selectedProductNames, uploadForm.productName]);

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!selectedEvent) return;

    const files = Array.from(event.target.files ?? []);
    const images = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
    const today = new Date().toISOString();

    images.forEach((imageUrl) => {
      addStudioToolPhoto({
        id: createId("tool_photo"),
        eventId: selectedEvent.id,
        imageUrl,
        productName: uploadForm.productName,
        quantity: uploadForm.quantity,
        status: uploadForm.status,
        note: uploadForm.note,
        createdAt: today
      });
    });

    event.target.value = "";
  }

  return (
    <>
      <PageHeader
        title="סטודיו"
        description="תיקי סדנה אחרי האירוע: מצלמים כלים, משייכים לאירוע ומקדמים אותם בגלזורה, שריפה, אריזה ומשלוח."
      />

      {workshopEvents.length ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <LoadCard icon={<Sparkles size={20} />} label="מחכים לגלזורה" value={studioLoad.needsGlaze} tone="bg-lavender/70" />
            <LoadCard icon={<Flame size={20} />} label="מחכים לשריפה" value={studioLoad.needsFiring} tone="bg-coral/25" />
            <LoadCard icon={<Package size={20} />} label="מחכים לאריזה" value={studioLoad.needsPacking} tone="bg-peach" />
            <LoadCard icon={<Truck size={20} />} label="מחכים למסירה" value={studioLoad.needsDelivery} tone="bg-mint" />
            <Card className="space-y-3">
              <p className="text-sm font-black text-clay">תנורים משוערים</p>
              <p className="text-3xl font-black text-ink">{studioLoad.estimatedKilns}</p>
              <Field label="קיבולת תנור בכלים" value={kilnCapacity} onChange={(value) => setKilnCapacity(Math.max(1, value))} />
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-3">
              {workshopEvents.map((event) => {
                const photos = data.studioToolPhotos.filter((photo) => photo.eventId === event.id);
                const deadline = getStudioDeadline(event.date);
                const active = event.id === selectedEvent?.id;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    className={`w-full rounded-[28px] border p-4 text-right transition ${
                      active ? "border-coral bg-coral text-white shadow-soft" : "border-white/60 bg-white/70 text-ink hover:bg-peach/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black">{event.title}</h2>
                        <p className={`mt-1 text-sm font-bold ${active ? "text-white/85" : "text-clay"}`}>
                          {event.date} · {event.participantCount} משתתפים
                        </p>
                        <p className={`mt-2 text-sm font-black ${active ? "text-white" : deadline.tone}`}>{deadline.label}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-black ${active ? "bg-white/20" : "bg-peach"}`}>
                        {photos.length} תמונות
                      </span>
                    </div>
                    <div className={`mt-4 grid grid-cols-3 gap-2 text-center text-sm font-black ${active ? "text-white" : "text-clay"}`}>
                      <MiniNumber label="כלים" value={sumPhotoQuantity(photos)} />
                      <MiniNumber label="פתוחים" value={photos.filter((photo) => !["delivered", "closed"].includes(photo.status)).length} />
                      <MiniNumber label="חריגים" value={photos.filter((photo) => exceptionStatuses.includes(photo.status)).length} />
                    </div>
                  </button>
                );
              })}
            </aside>

          {selectedEvent ? (
            <main className="space-y-5">
              <Card className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black text-clay">תיק סדנה</p>
                    <h2 className="text-3xl font-black text-ink">{selectedEvent.title}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge status={selectedEvent.status} />
                      <span className="rounded-full bg-peach/70 px-3 py-1 text-sm font-black text-clay">{selectedEvent.participantCount} משתתפים</span>
                      <span className="rounded-full bg-mint px-3 py-1 text-sm font-black text-emerald-950">{selectedPhotos.length} תמונות</span>
                      {selectedDeadline ? (
                        <span className={`rounded-full px-3 py-1 text-sm font-black ${selectedDeadline.badgeClass}`}>{selectedDeadline.label}</span>
                      ) : null}
                    </div>
                  </div>
                  <label className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-black text-white shadow-soft">
                    <Camera size={20} />
                    העלאת תמונות כלים
                    <input className="sr-only" type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.7fr_1.4fr]">
                  <label>
                    <span className="mb-2 block text-sm font-black text-clay">מה מצלמים</span>
                    <select className="input" value={uploadForm.productName} onChange={(event) => setUploadForm({ ...uploadForm, productName: event.target.value })}>
                      {uploadProductOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="כמות בתמונה" value={uploadForm.quantity} onChange={(quantity) => setUploadForm({ ...uploadForm, quantity })} />
                  <label>
                    <span className="mb-2 block text-sm font-black text-clay">הערה לפני צילום</span>
                    <input
                      className="input"
                      value={uploadForm.note}
                      onChange={(event) => setUploadForm({ ...uploadForm, note: event.target.value })}
                      placeholder="למשל: שולחן ימין, כלים של משפחת לוי"
                    />
                  </label>
                </div>
              </Card>

              <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-clay">זרימת טיפול</p>
                    <h3 className="text-2xl font-black text-ink">מה קורה לכלים</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studioToolFlow.map((status) => (
                      <span key={status} className={`rounded-full px-3 py-1 text-xs font-black ${studioToolStatusColors[status]}`}>
                        {studioToolStatusLabels[status]}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedPhotos.length ? (
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {selectedPhotos.map((photo) => (
                      <ToolPhotoCard
                        key={photo.id}
                        photo={photo}
                        productNames={selectedProductNames}
                        onChange={updateStudioToolPhoto}
                        onDelete={() => deleteStudioToolPhoto(photo.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="עוד אין תמונות לכלים" body="בסוף הסדנה מעלים כאן תמונות, כדי לדעת בדיוק מה שייך לאיזה אירוע ומה מצב הטיפול." />
                )}
              </Card>
            </main>
          ) : null}
          </div>
        </div>
      ) : (
        <EmptyState title="עוד אין תיקי סדנה" body="ברגע שיהיה אירוע, אפשר יהיה לפתוח ממנו תיק סטודיו ולצלם אליו כלים." />
      )}
    </>
  );
}

function LoadCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <Card>
      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${tone} text-ink`}>{icon}</div>
      <p className="text-sm font-black text-clay">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </Card>
  );
}

function ToolPhotoCard({
  photo,
  productNames,
  onChange,
  onDelete
}: {
  photo: StudioToolPhoto;
  productNames: string[];
  onChange: (photo: StudioToolPhoto) => void;
  onDelete: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white/70 shadow-soft">
      <div className="aspect-[4/3] bg-peach/50">
        <img src={photo.imageUrl} alt={photo.productName} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-black ${studioToolStatusColors[photo.status]}`}>
            {studioToolStatusLabels[photo.status]}
          </span>
          <ActionButton tone="danger" onClick={onDelete}>
            <Trash2 size={16} />
          </ActionButton>
        </div>
        <label>
          <span className="mb-2 block text-sm font-black text-clay">סטטוס</span>
          <select className="input" value={photo.status} onChange={(event) => onChange({ ...photo, status: event.target.value as StudioToolStatus })}>
            {[...studioToolFlow, ...exceptionStatuses].map((status) => (
              <option key={status} value={status}>
                {studioToolStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <label>
            <span className="mb-2 block text-sm font-black text-clay">פריט</span>
            <input
              className="input"
              list={`studio-product-names-${photo.id}`}
              value={photo.productName}
              onChange={(event) => onChange({ ...photo, productName: event.target.value })}
            />
            <datalist id={`studio-product-names-${photo.id}`}>
              {productNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <Field label="כמות" value={photo.quantity} onChange={(quantity) => onChange({ ...photo, quantity })} />
        </div>
        <label>
          <span className="mb-2 block text-sm font-black text-clay">הערה</span>
          <textarea
            className="input min-h-24 resize-none"
            value={photo.note}
            onChange={(event) => onChange({ ...photo, note: event.target.value })}
            placeholder="שם משתתף, שולחן, בעיה, סימון אריזה..."
          />
        </label>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      <input className="input" type="number" min="1" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function MiniNumber({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-2xl bg-white/20 px-2 py-2">
      <span className="block text-lg">{value}</span>
      <span className="block text-xs">{label}</span>
    </span>
  );
}

function getWorkshopEvents(events: Event[], photos: StudioToolPhoto[]) {
  const photoEventIds = new Set(photos.map((photo) => photo.eventId));
  const relevantStatuses = new Set(["completed", "studio_work", "glazing", "firing", "packing", "delivered", "closed"]);
  return events
    .filter((event) => photoEventIds.has(event.id) || relevantStatuses.has(event.status) || event.status !== "cancelled")
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getEventProductNames(event: Event, products: { id: string; name: string }[]) {
  const names = event.items
    .map((item) => products.find((product) => product.id === item.productId)?.name)
    .filter((name): name is string => Boolean(name));
  return Array.from(new Set(names));
}

function sumPhotoQuantity(photos: StudioToolPhoto[]) {
  return photos.reduce((sum, photo) => sum + photo.quantity, 0);
}

function calculateStudioLoad(photos: StudioToolPhoto[], kilnCapacity: number) {
  const needsGlaze = sumPhotoQuantity(photos.filter((photo) => ["photographed", "needs_glaze"].includes(photo.status)));
  const needsFiring = sumPhotoQuantity(photos.filter((photo) => ["glazed", "needs_firing"].includes(photo.status)));
  const needsPacking = sumPhotoQuantity(photos.filter((photo) => ["fired", "needs_packing"].includes(photo.status)));
  const needsDelivery = sumPhotoQuantity(photos.filter((photo) => ["packed", "needs_delivery"].includes(photo.status)));

  return {
    needsGlaze,
    needsFiring,
    needsPacking,
    needsDelivery,
    estimatedKilns: needsFiring > 0 ? Math.ceil(needsFiring / Math.max(1, kilnCapacity)) : 0
  };
}

function getStudioDeadline(eventDate: string) {
  const deadline = addDays(parseLocalDate(eventDate), 14);
  const today = startOfDay(new Date());
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
  const formatted = formatDate(deadline);

  if (daysLeft < 0) {
    return {
      label: `באיחור ${Math.abs(daysLeft)} ימים · התחייבות ${formatted}`,
      tone: "text-red-900",
      badgeClass: "bg-red-100 text-red-900"
    };
  }

  if (daysLeft <= 3) {
    return {
      label: `דחוף · ${daysLeft} ימים לאיסוף`,
      tone: "text-orange-950",
      badgeClass: "bg-peach text-orange-950"
    };
  }

  return {
    label: `עדכון איסוף עד ${formatted}`,
    tone: "text-clay",
    badgeClass: "bg-mint text-emerald-950"
  };
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
