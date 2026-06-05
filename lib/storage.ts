"use client";

import { useEffect, useMemo, useState } from "react";
import { seedData } from "./seedData";
import type { BusinessSettings, Client, Employee, Event, Product, Quote, QuoteItem, StudioData } from "./types";

const STORAGE_KEY = "manuto-flow-data-v2";

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

export function useStudioData() {
  const [data, setData] = useState<StudioData>(seedData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadStudioData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      saveStudioData(data);
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
          events: current.events.map((event) => (event.productId === id ? { ...event, productId: "" } : event)),
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
          studioTasks: current.studioTasks.filter((item) => item.eventId !== id)
        })),
      addQuote: (quote: Quote) => setData((current) => ({ ...current, quotes: [quote, ...current.quotes] })),
      updateQuote: (quote: Quote) =>
        setData((current) => ({ ...current, quotes: current.quotes.map((item) => (item.id === quote.id ? quote : item)) })),
      deleteQuote: (id: string) => setData((current) => ({ ...current, quotes: current.quotes.filter((item) => item.id !== id) })),
      updateSettings: (businessSettings: BusinessSettings) => setData((current) => ({ ...current, businessSettings })),
      resetData: () => setData(seedData)
    }),
    []
  );

  return { data, ready, setData, ...actions };
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
    events: value.events ?? seedData.events,
    quotes
  };
}

function normalizeQuote(quote: Quote & Partial<{
  participantCount: number;
  productId: string;
  pricePerParticipantIncVat: number;
  unitCostExVat: number;
}>): Quote {
  if (quote.items?.length) return quote;

  const legacyItem: QuoteItem = {
    id: createId("quote_item"),
    productId: quote.productId ?? seedData.products[0]?.id ?? "",
    quantity: quote.participantCount ?? 1,
    pricePerParticipantIncVat: quote.pricePerParticipantIncVat ?? 0,
    unitCostExVat: quote.unitCostExVat ?? 0
  };

  return {
    ...quote,
    items: [legacyItem]
  };
}
