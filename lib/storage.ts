"use client";

import { useEffect, useMemo, useState } from "react";
import { seedData } from "./seedData";
import { supabase } from "./supabase";
import type { BusinessSettings, Client, Employee, Event, EventItem, Product, Quote, QuoteItem, StudioData, StudioToolPhoto } from "./types";

const STORAGE_KEY = "manuto-flow-data-v2";
const REMOTE_STATE_ID = "main";

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

async function loadRemoteStudioData(): Promise<StudioData | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from("studio_state").select("data").eq("id", REMOTE_STATE_ID).maybeSingle();

  if (error) {
    console.warn("Could not load studio state from Supabase", error.message);
    return null;
  }

  return data?.data ? normalizeData(data.data as StudioData) : null;
}

async function saveRemoteStudioData(data: StudioData) {
  if (!supabase) return;

  const { error } = await supabase.from("studio_state").upsert({
    id: REMOTE_STATE_ID,
    data,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.warn("Could not save studio state to Supabase", error.message);
  }
}

export function useStudioData() {
  const [data, setData] = useState<StudioData>(seedData);
  const [ready, setReady] = useState(false);
  const [syncMode, setSyncMode] = useState<"local" | "supabase">("local");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const localData = loadStudioData();

      if (!supabase) {
        if (!cancelled) {
          setData(localData);
          setSyncMode("local");
          setReady(true);
        }
        return;
      }

      const remoteData = await loadRemoteStudioData();
      const nextData = remoteData ?? localData;

      if (!remoteData) {
        await saveRemoteStudioData(localData);
      }

      if (!cancelled) {
        setData(nextData);
        saveStudioData(nextData);
        setSyncMode("supabase");
        setReady(true);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) {
      saveStudioData(data);
      saveRemoteStudioData(data);
    }
  }, [data, ready]);

  const actions = useMemo(
    () => ({
      addClient: (client: Client) => setData((current) => ({ ...current, clients: [client, ...current.clients] })),
      updateClient: (client: Client) =>
        setData((current) => ({ ...current, clients: current.clients.map((item) => (item.id === client.id ? client : item)) })),
      deleteClient: (id: string) =>
        setData((current) => ({
          ...current,
          clients: current.clients.filter((item) => item.id !== id),
          events: current.events.map((event) => (event.clientId === id ? { ...event, clientId: "" } : event)),
          quotes: current.quotes.map((quote) => (quote.clientId === id ? { ...quote, clientId: "" } : quote))
        })),
      addProduct: (product: Product) => setData((current) => ({ ...current, products: [product, ...current.products] })),
      updateProduct: (product: Product) =>
        setData((current) => ({ ...current, products: current.products.map((item) => (item.id === product.id ? product : item)) })),
      deleteProduct: (id: string) =>
        setData((current) => ({
          ...current,
          products: current.products.filter((item) => item.id !== id),
          events: current.events.map((event) => ({
            ...event,
            items: (event.items ?? []).map((item) => (item.productId === id ? { ...item, productId: "" } : item))
          })),
          quotes: current.quotes.map((quote) => ({
            ...quote,
            items: (quote.items ?? []).map((item) => (item.productId === id ? { ...item, productId: "" } : item))
          }))
        })),
      addEmployee: (employee: Employee) => setData((current) => ({ ...current, employees: [employee, ...current.employees] })),
      updateEmployee: (employee: Employee) =>
        setData((current) => ({ ...current, employees: current.employees.map((item) => (item.id === employee.id ? employee : item)) })),
      deleteEmployee: (id: string) =>
        setData((current) => ({
          ...current,
          employees: current.employees.filter((item) => item.id !== id),
          events: current.events.map((event) => ({ ...event, assignments: event.assignments.filter((item) => item.employeeId !== id) })),
          quotes: current.quotes.map((quote) => (quote.employeeId === id ? { ...quote, employeeId: "", employeeHourlyRate: 0 } : quote))
        })),
      addEvent: (event: Event) => setData((current) => ({ ...current, events: [event, ...current.events] })),
      updateEvent: (event: Event) =>
        setData((current) => ({ ...current, events: current.events.map((item) => (item.id === event.id ? event : item)) })),
      deleteEvent: (id: string) =>
        setData((current) => ({
          ...current,
          events: current.events.filter((item) => item.id !== id),
          quotes: current.quotes.filter((item) => item.eventId !== id),
          studioTasks: current.studioTasks.filter((item) => item.eventId !== id),
          studioToolPhotos: current.studioToolPhotos.filter((item) => item.eventId !== id)
        })),
      addQuote: (quote: Quote) => setData((current) => ({ ...current, quotes: [quote, ...current.quotes] })),
      updateQuote: (quote: Quote) =>
        setData((current) => ({ ...current, quotes: current.quotes.map((item) => (item.id === quote.id ? quote : item)) })),
      deleteQuote: (id: string) => setData((current) => ({ ...current, quotes: current.quotes.filter((item) => item.id !== id) })),
      addStudioToolPhoto: (photo: StudioToolPhoto) =>
        setData((current) => ({ ...current, studioToolPhotos: [photo, ...(current.studioToolPhotos ?? [])] })),
      updateStudioToolPhoto: (photo: StudioToolPhoto) =>
        setData((current) => ({
          ...current,
          studioToolPhotos: (current.studioToolPhotos ?? []).map((item) => (item.id === photo.id ? photo : item))
        })),
      deleteStudioToolPhoto: (id: string) =>
        setData((current) => ({ ...current, studioToolPhotos: (current.studioToolPhotos ?? []).filter((item) => item.id !== id) })),
      updateSettings: (businessSettings: BusinessSettings) => setData((current) => ({ ...current, businessSettings })),
      resetData: () => setData(seedData)
    }),
    []
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
