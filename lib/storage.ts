"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { seedData } from "./seedData";
import { supabase } from "./supabase";
import type {
  BusinessSettings,
  Client,
  Employee,
  EmployeeWorkLog,
  Event,
  EventItem,
  InventoryItem,
  Product,
  Quote,
  QuoteItem,
  StudioData,
  StudioToolPhoto
} from "./types";

const STORAGE_KEY = "manuto-flow-data-v2";
const BACKUP_KEY_PREFIX = "manuto-flow-data-backup";
const REMOTE_STATE_ID = "main";
type RemoteStudioData =
  | { status: "found"; data: StudioData; updatedAt: string | null }
  | { status: "missing" }
  | { status: "error"; error: string };

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function loadStudioData(): StudioData {
  if (typeof window === "undefined") {
    return seedData;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    saveStudioData(seedData);
    return seedData;
  }

  try {
    return normalizeData(JSON.parse(stored));
  } catch {
    saveStudioData(seedData);
    return seedData;
  }
}

export function saveStudioData(data: StudioData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function backupStudioData(data: StudioData, reason: string) {
  if (typeof window === "undefined") return;

  const backup = {
    createdAt: new Date().toISOString(),
    reason,
    data
  };

  window.localStorage.setItem(`${BACKUP_KEY_PREFIX}-${Date.now()}`, JSON.stringify(backup));

  const backupKeys = Object.keys(window.localStorage)
    .filter((key) => key.startsWith(BACKUP_KEY_PREFIX))
    .sort()
    .reverse();

  backupKeys.slice(10).forEach((key) => window.localStorage.removeItem(key));
}

function countStudioRecords(data: StudioData) {
  return (
    (data.clients?.length ?? 0) +
    (data.products?.length ?? 0) +
    (data.employees?.length ?? 0) +
    (data.employeeWorkLogs?.length ?? 0) +
    (data.events?.length ?? 0) +
    (data.quotes?.length ?? 0) +
    (data.inventory?.length ?? 0) +
    (data.studioTasks?.length ?? 0) +
    (data.studioToolPhotos?.length ?? 0) +
    (data.supplierProducts?.length ?? 0)
  );
}

function shouldRecoverFromLocal(localData: StudioData, remoteData: StudioData) {
  const localCount = countStudioRecords(localData);
  const remoteCount = countStudioRecords(remoteData);
  const seedCount = countStudioRecords(seedData);

  return localCount > remoteCount + 2 && remoteCount <= seedCount + 2;
}

async function loadRemoteStudioData(): Promise<RemoteStudioData | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from("studio_state").select("data, updated_at").eq("id", REMOTE_STATE_ID).maybeSingle();

  if (error) {
    console.warn("Could not load studio state from Supabase", error.message);
    return { status: "error", error: error.message };
  }

  return data?.data ? { status: "found", data: normalizeData(data.data as StudioData), updatedAt: data.updated_at ?? null } : { status: "missing" };
}

async function saveRemoteStudioData(data: StudioData) {
  if (!supabase) return false;

  const { error } = await supabase.from("studio_state").upsert({
    id: REMOTE_STATE_ID,
    data,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.warn("Could not save studio state to Supabase", error.message);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("manuto-flow-sync-error", error.message);
    }
    return false;
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("manuto-flow-sync-error");
  }
  return true;
}

export function useStudioData() {
  const [data, setData] = useState<StudioData>(seedData);
  const [ready, setReady] = useState(false);
  const [syncMode, setSyncMode] = useState<"local" | "supabase">("local");
  const applyingRemoteData = useRef(false);
  const lastSavedData = useRef("");
  const currentSerializedData = useRef(JSON.stringify(seedData));
  const currentData = useRef<StudioData>(seedData);
  const isSaving = useRef(false);

  const persistData = useCallback((nextData: StudioData) => {
    const serializedData = JSON.stringify(nextData);

    currentData.current = nextData;
    currentSerializedData.current = serializedData;
    saveStudioData(nextData);

    if (!supabase) {
      lastSavedData.current = serializedData;
      return;
    }

    isSaving.current = true;
    saveRemoteStudioData(nextData).then((saved) => {
      if (saved && currentSerializedData.current === serializedData) {
        lastSavedData.current = serializedData;
      }
      isSaving.current = false;
    });
  }, []);

  const commitData = useCallback(
    (updater: (current: StudioData) => StudioData) => {
      setData((current) => {
        const nextData = updater(current);
        persistData(nextData);
        return nextData;
      });
    },
    [persistData]
  );

  function applyRemoteData(nextData: StudioData, force = false) {
    const normalizedData = normalizeData(nextData);
    const serializedData = JSON.stringify(normalizedData);

    if (!force && serializedData === currentSerializedData.current) return;

    if (shouldRecoverFromLocal(currentData.current, normalizedData)) {
      backupStudioData(normalizedData, "incoming-cloud-looked-reset");
      saveRemoteStudioData(currentData.current);
      return;
    }

    if (currentSerializedData.current !== JSON.stringify(seedData)) {
      backupStudioData(currentData.current, "before-cloud-apply");
    }

    applyingRemoteData.current = true;
    lastSavedData.current = serializedData;
    currentData.current = normalizedData;
    currentSerializedData.current = serializedData;
    setData(normalizedData);
    saveStudioData(normalizedData);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!supabase) {
        const localData = loadStudioData();
        if (!cancelled) {
          currentData.current = localData;
          currentSerializedData.current = JSON.stringify(localData);
          setData(localData);
          setSyncMode("local");
          setReady(true);
        }
        return;
      }

      const localData = loadStudioData();
      currentData.current = localData;
      currentSerializedData.current = JSON.stringify(localData);

      const remoteRow = await loadRemoteStudioData();

      if (remoteRow?.status === "error") {
        if (!cancelled) {
          lastSavedData.current = JSON.stringify(localData);
          setData(localData);
          setSyncMode("local");
          setReady(true);
        }
        return;
      }

      const shouldUseLocalRecovery = remoteRow?.status === "found" && shouldRecoverFromLocal(localData, remoteRow.data);
      const nextData = shouldUseLocalRecovery || remoteRow?.status !== "found" ? localData : remoteRow.data;
      const serializedData = JSON.stringify(nextData);

      if (shouldUseLocalRecovery) {
        backupStudioData(remoteRow.data, "cloud-looked-reset-before-local-recovery");
        const saved = await saveRemoteStudioData(localData);
        if (saved) {
          lastSavedData.current = JSON.stringify(localData);
        }
      }

      if (remoteRow?.status === "missing") {
        const saved = await saveRemoteStudioData(localData);
        if (saved) {
          lastSavedData.current = JSON.stringify(localData);
        }
      }

      if (!cancelled) {
        applyingRemoteData.current = remoteRow?.status === "found" && !shouldUseLocalRecovery;
        if (remoteRow?.status === "found" && !shouldUseLocalRecovery) {
          lastSavedData.current = serializedData;
        }
        currentData.current = nextData;
        currentSerializedData.current = serializedData;
        setData(nextData);
        saveStudioData(nextData);
        setSyncMode("supabase");
        setReady(true);
      }
    }

    loadData();

    async function refreshFromCloud() {
      if (isSaving.current) return;

      const remoteRow = await loadRemoteStudioData();
      if (remoteRow?.status === "found") applyRemoteData(remoteRow.data);
    }

    const channel = supabase
      ?.channel("studio-state-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "studio_state", filter: `id=eq.${REMOTE_STATE_ID}` },
        (payload) => {
          if (payload.eventType === "DELETE") return;

          const nextData = (payload.new as { data?: StudioData } | null)?.data;
          if (!nextData) return;

          if (!isSaving.current) {
            applyRemoteData(nextData);
          }
        }
      )
      .subscribe();

    const pollId = window.setInterval(refreshFromCloud, 5000);
    window.addEventListener("focus", refreshFromCloud);
    document.addEventListener("visibilitychange", refreshFromCloud);

    return () => {
      cancelled = true;
      if (channel) {
        supabase?.removeChannel(channel);
      }
      window.clearInterval(pollId);
      window.removeEventListener("focus", refreshFromCloud);
      document.removeEventListener("visibilitychange", refreshFromCloud);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (applyingRemoteData.current) {
      applyingRemoteData.current = false;
      return;
    }

    const serializedData = JSON.stringify(data);
    if (serializedData === lastSavedData.current) return;
    if (isSaving.current && serializedData === currentSerializedData.current) return;

    persistData(data);
  }, [data, persistData, ready]);

  const actions = useMemo(
    () => ({
      addClient: (client: Client) => commitData((current) => ({ ...current, clients: [client, ...current.clients] })),
      updateClient: (client: Client) =>
        commitData((current) => ({ ...current, clients: current.clients.map((item) => (item.id === client.id ? client : item)) })),
      deleteClient: (id: string) =>
        commitData((current) => ({
          ...current,
          clients: current.clients.filter((item) => item.id !== id),
          events: current.events.map((event) => (event.clientId === id ? { ...event, clientId: "" } : event)),
          quotes: current.quotes.map((quote) => (quote.clientId === id ? { ...quote, clientId: "" } : quote))
        })),
      addProduct: (product: Product) =>
        commitData((current) => ({
          ...current,
          products: [product, ...current.products],
          inventory: [
            {
              id: createId("inventory"),
              productId: product.id,
              quantityOnHand: 0,
              quantityReserved: 0,
              reorderThreshold: 10,
              averageUnitCostExVat: product.averageUnitCostExVat
            },
            ...current.inventory
          ]
        })),
      updateProduct: (product: Product) =>
        commitData((current) => ({ ...current, products: current.products.map((item) => (item.id === product.id ? product : item)) })),
      deleteProduct: (id: string) =>
        commitData((current) => ({
          ...current,
          products: current.products.filter((item) => item.id !== id),
          inventory: current.inventory.filter((item) => item.productId !== id),
          events: current.events.map((event) => ({
            ...event,
            items: (event.items ?? []).map((item) => (item.productId === id ? { ...item, productId: "" } : item))
          })),
          quotes: current.quotes.map((quote) => ({
            ...quote,
            items: (quote.items ?? []).map((item) => (item.productId === id ? { ...item, productId: "" } : item))
          }))
        })),
      updateInventoryItem: (inventoryItem: InventoryItem) =>
        commitData((current) => {
          const hasItem = current.inventory.some((item) => item.id === inventoryItem.id || item.productId === inventoryItem.productId);

          return {
            ...current,
            inventory: hasItem
              ? current.inventory.map((item) => (item.id === inventoryItem.id || item.productId === inventoryItem.productId ? inventoryItem : item))
              : [inventoryItem, ...current.inventory]
          };
        }),
      addEmployee: (employee: Employee) => commitData((current) => ({ ...current, employees: [employee, ...current.employees] })),
      updateEmployee: (employee: Employee) =>
        commitData((current) => ({ ...current, employees: current.employees.map((item) => (item.id === employee.id ? employee : item)) })),
      deleteEmployee: (id: string) =>
        commitData((current) => ({
          ...current,
          employees: current.employees.filter((item) => item.id !== id),
          employeeWorkLogs: (current.employeeWorkLogs ?? []).filter((item) => item.employeeId !== id),
          events: current.events.map((event) => ({ ...event, assignments: event.assignments.filter((item) => item.employeeId !== id) })),
          quotes: current.quotes.map((quote) => (quote.employeeId === id ? { ...quote, employeeId: "", employeeHourlyRate: 0 } : quote))
        })),
      addEvent: (event: Event) => commitData((current) => ({ ...current, events: [event, ...current.events] })),
      updateEvent: (event: Event) =>
        commitData((current) => ({ ...current, events: current.events.map((item) => (item.id === event.id ? event : item)) })),
      deleteEvent: (id: string) =>
        commitData((current) => ({
          ...current,
          events: current.events.filter((item) => item.id !== id),
          employeeWorkLogs: (current.employeeWorkLogs ?? []).filter((item) => item.eventId !== id),
          quotes: current.quotes.filter((item) => item.eventId !== id),
          studioTasks: current.studioTasks.filter((item) => item.eventId !== id),
          studioToolPhotos: current.studioToolPhotos.filter((item) => item.eventId !== id)
        })),
      addEmployeeWorkLog: (workLog: EmployeeWorkLog) =>
        commitData((current) => ({ ...current, employeeWorkLogs: [workLog, ...(current.employeeWorkLogs ?? [])] })),
      updateEmployeeWorkLog: (workLog: EmployeeWorkLog) =>
        commitData((current) => ({
          ...current,
          employeeWorkLogs: (current.employeeWorkLogs ?? []).map((item) => (item.id === workLog.id ? workLog : item))
        })),
      deleteEmployeeWorkLog: (id: string) =>
        commitData((current) => ({ ...current, employeeWorkLogs: (current.employeeWorkLogs ?? []).filter((item) => item.id !== id) })),
      addQuote: (quote: Quote) => commitData((current) => ({ ...current, quotes: [quote, ...current.quotes] })),
      updateQuote: (quote: Quote) =>
        commitData((current) => ({ ...current, quotes: current.quotes.map((item) => (item.id === quote.id ? quote : item)) })),
      deleteQuote: (id: string) => commitData((current) => ({ ...current, quotes: current.quotes.filter((item) => item.id !== id) })),
      addStudioToolPhoto: (photo: StudioToolPhoto) =>
        commitData((current) => ({ ...current, studioToolPhotos: [photo, ...(current.studioToolPhotos ?? [])] })),
      updateStudioToolPhoto: (photo: StudioToolPhoto) =>
        commitData((current) => ({
          ...current,
          studioToolPhotos: (current.studioToolPhotos ?? []).map((item) => (item.id === photo.id ? photo : item))
        })),
      deleteStudioToolPhoto: (id: string) =>
        commitData((current) => ({ ...current, studioToolPhotos: (current.studioToolPhotos ?? []).filter((item) => item.id !== id) })),
      updateSettings: (businessSettings: BusinessSettings) => commitData((current) => ({ ...current, businessSettings })),
      resetData: () => commitData(() => seedData)
    }),
    [commitData]
  );

  return { data, ready, syncMode, setData, ...actions };
}

function normalizeData(value: StudioData): StudioData {
  const products = (value.products ?? seedData.products).map((product) => ({
    ...product,
    imageUrl: product.imageUrl ?? ""
  }));

  const clients = (value.clients ?? seedData.clients).map((client) => ({
    ...client,
    clientStatus: client.clientStatus ?? "interested"
  }));

  const quotes = (value.quotes ?? seedData.quotes).map((quote) => normalizeQuote(quote));

  return {
    ...seedData,
    ...value,
    clients,
    products,
    employees: value.employees ?? seedData.employees,
    employeeWorkLogs: (value.employeeWorkLogs ?? seedData.employeeWorkLogs).map((workLog) => ({
      ...workLog,
      eventId: workLog.eventId ?? "",
      hours: workLog.hours ?? calculateHours(workLog.startTime, workLog.endTime),
      hourlyRate: workLog.hourlyRate ?? value.employees?.find((employee) => employee.id === workLog.employeeId)?.hourlyRate ?? 0,
      note: workLog.note ?? "",
      createdAt: workLog.createdAt ?? new Date().toISOString()
    })),
    events: (value.events ?? seedData.events).map((event) => normalizeEvent(event)),
    quotes,
    studioToolPhotos: (value.studioToolPhotos ?? seedData.studioToolPhotos).map((photo) => ({
      ...photo,
      productName: photo.productName ?? "כלי",
      quantity: photo.quantity ?? 1,
      status: photo.status ?? "photographed",
      note: photo.note ?? ""
    }))
  };
}

function calculateHours(startTime = "09:00", endTime = "10:00") {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return Math.max(0, Number(((end - start) / 60).toFixed(2)));
}

function normalizeEvent(event: Event & Partial<{
  productId: string;
  participantPriceIncVat: number;
}>): Event {
  const legacyProduct = seedData.products.find((product) => product.id === event.productId) ?? seedData.products[0];
  const legacyItem: EventItem = {
    id: createId("event_item"),
    productId: event.productId ?? legacyProduct?.id ?? "",
    quantity: event.participantCount ?? 1,
    pricePerItemIncVat: event.participantPriceIncVat ?? legacyProduct?.recommendedParticipantPriceIncVat ?? 0,
    unitCostExVat: legacyProduct?.averageUnitCostExVat ?? 0
  };

  return {
    ...event,
    contactPhone: event.contactPhone ?? "",
    items: event.items?.length ? event.items : [legacyItem],
    expenses: {
      ...event.expenses,
      arrivalCost: event.expenses?.arrivalCost ?? 0,
      deliveryCost: event.expenses?.deliveryCost ?? 0
    }
  };
}

function normalizeQuote(quote: Quote & Partial<{
  participantCount: number;
  productId: string;
  pricePerParticipantIncVat: number;
  unitCostExVat: number;
}>): Quote {
  const legacyItem: QuoteItem = {
    id: createId("quote_item"),
    productId: quote.productId ?? seedData.products[0]?.id ?? "",
    quantity: quote.participantCount ?? 1,
    pricePerParticipantIncVat: quote.pricePerParticipantIncVat ?? 0,
    unitCostExVat: quote.unitCostExVat ?? 0
  };

  return {
    ...quote,
    staffCount: quote.staffCount ?? 1,
    items: quote.items?.length ? quote.items : [legacyItem]
  };
}
