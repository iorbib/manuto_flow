export type EventStatus =
  | "lead"
  | "quote_needed"
  | "quote_sent"
  | "waiting_approval"
  | "approved"
  | "preparing"
  | "ready_to_go"
  | "completed"
  | "studio_work"
  | "glazing"
  | "firing"
  | "packing"
  | "delivered"
  | "paid"
  | "closed"
  | "cancelled";

export type EventType =
  | "company"
  | "therapy_center"
  | "school"
  | "birthday"
  | "community"
  | "private"
  | "other";

export type Client = {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  city: string;
  notes: string;
};

export type Product = {
  id: string;
  name: string;
  defaultUnitCostExVat: number;
  defaultParticipantPriceIncVat: number;
};

export type Employee = {
  id: string;
  name: string;
  role: "owner" | "employee";
  hourlyRate: number;
};

export type EventEmployeeAssignment = {
  employeeId: string;
  eventHours: number;
};

export type Event = {
  id: string;
  title: string;
  clientId: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  participantCount: number;
  eventType: EventType;
  customEventType: string;
  eventDescription: string;
  status: EventStatus;
  productId: string;
  participantPriceIncVat: number;
  eventHours: number;
  assignments: EventEmployeeAssignment[];
  expenses: EventExpenseConfig;
};

export type EventExpenseConfig = {
  paintCost: number;
  glazeCost: number;
  packagingCost: number;
  firingCost: number;
  logisticsCost: number;
  extraExpenses?: number;
};

export type InventoryItem = {
  id: string;
  productId: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderThreshold: number;
  averageUnitCostExVat: number;
};

export type StudioTask = {
  id: string;
  title: string;
  eventId: string;
  status: "open" | "doing" | "done";
  dueDate: string;
};

export type Quote = {
  id: string;
  eventId: string;
  status: "draft" | "sent" | "approved";
  createdAt: string;
};

export type SupplierProduct = {
  id: string;
  supplierName: string;
  supplierProductName: string;
  supplierCategory: string;
  productUrl: string;
  priceIncVat: number;
  priceExVat: number;
  vatRate: number;
  matchedProductId?: string;
  lastCheckedAt: string;
};

export type BusinessSettings = {
  vatRate: number;
  defaultEventHours: number;
  defaultPaintCost: number;
  defaultGlazeCost: number;
  defaultPackagingCost: number;
  defaultFiringCost: number;
  defaultLogisticsCost: number;
};
