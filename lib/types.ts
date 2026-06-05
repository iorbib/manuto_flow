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
  email: string;
  clientType: "company" | "therapy_center" | "school" | "private" | "community" | "other";
  notes: string;
};

export type Product = {
  id: string;
  name: string;
  type: string;
  averageUnitCostExVat: number;
  recommendedParticipantPriceIncVat: number;
  supplierName: string;
  supplierUrl: string;
  isActive: boolean;
};

export type Employee = {
  id: string;
  name: string;
  role: "בעלים" | "עובדת" | "פרילנס";
  hourlyRate: number;
  phone: string;
  isActive: boolean;
  notes: string;
};

export type EventEmployeeAssignment = {
  employeeId: string;
  eventHours: number;
};

export type Event = {
  id: string;
  title: string;
  clientId: string;
  contactName: string;
  date: string;
  startTime: string;
  endTime: string;
  address: string;
  hasTables: boolean;
  hasChairs: boolean;
  hasWater: boolean;
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
  internalNotes: string;
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
  clientId: string;
  eventId: string;
  participantCount: number;
  productId: string;
  pricePerParticipantIncVat: number;
  unitCostExVat: number;
  employeeId: string;
  employeeHours: number;
  employeeHourlyRate: number;
  paintCost: number;
  glazeCost: number;
  packagingCost: number;
  firingCost: number;
  logisticsCost: number;
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

export type StudioData = {
  clients: Client[];
  products: Product[];
  employees: Employee[];
  events: Event[];
  quotes: Quote[];
  inventory: InventoryItem[];
  studioTasks: StudioTask[];
  supplierProducts: SupplierProduct[];
  businessSettings: BusinessSettings;
  dailySupportMessages: string[];
};
