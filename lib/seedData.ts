import type {
  BusinessSettings,
  Client,
  Employee,
  Event,
  EventStatus,
  InventoryItem,
  Product,
  Quote,
  StudioData,
  StudioTask,
  StudioToolPhoto,
  StudioToolStatus,
  SupplierProduct
} from "./types";

export const statusLabels: Record<EventStatus, string> = {
  lead: "פנייה חדשה",
  quote_needed: "צריך להכין הצעה",
  quote_sent: "הצעה נשלחה",
  waiting_approval: "מחכה לאישור",
  approved: "אושר",
  preparing: "בהכנות",
  ready_to_go: "מוכן ליציאה",
  completed: "הסדנה התקיימה",
  studio_work: "בטיפול סטודיו",
  glazing: "בגלזורה",
  firing: "בשריפה",
  packing: "באריזה",
  delivered: "נמסר ללקוח",
  paid: "שולם",
  closed: "נסגר",
  cancelled: "בוטל"
};

export const statusColors: Record<EventStatus, string> = {
  lead: "bg-sky/70 text-sky-950",
  quote_needed: "bg-lavender/80 text-purple-950",
  quote_sent: "bg-blush/70 text-rose-950",
  waiting_approval: "bg-peach text-orange-950",
  approved: "bg-mint text-emerald-950",
  preparing: "bg-sand text-yellow-950",
  ready_to_go: "bg-coral/80 text-white",
  completed: "bg-clay/20 text-clay",
  studio_work: "bg-lavender/70 text-purple-950",
  glazing: "bg-sky/70 text-sky-950",
  firing: "bg-coral/25 text-red-950",
  packing: "bg-peach text-orange-950",
  delivered: "bg-mint text-emerald-950",
  paid: "bg-emerald-100 text-emerald-900",
  closed: "bg-stone-200 text-stone-800",
  cancelled: "bg-red-100 text-red-900"
};

export const statusTimeline: { key: EventStatus; label: string }[] = [
  { key: "lead", label: "פנייה" },
  { key: "quote_sent", label: "הצעה" },
  { key: "approved", label: "אושר" },
  { key: "preparing", label: "בהכנות" },
  { key: "completed", label: "התקיים" },
  { key: "glazing", label: "גלזורה" },
  { key: "firing", label: "שריפה" },
  { key: "packing", label: "אריזה" },
  { key: "delivered", label: "נמסר" }
];

export const eventTypeLabels = {
  company: "חברה",
  therapy_center: "מרכז טיפולי",
  school: "בית ספר",
  birthday: "יום הולדת",
  community: "קהילה",
  private: "פרטי",
  other: "אחר"
};

export const clientStatusLabels = {
  interested: "מתעניינת",
  follow_up: "לחזור אליה",
  proposal: "בהצעה",
  booked: "סגרה אירוע",
  inactive: "לא פעילה"
};

export const studioToolStatusLabels: Record<StudioToolStatus, string> = {
  photographed: "צולם בסדנה",
  needs_glaze: "צריך גלזורה",
  glazed: "עבר גלזורה",
  needs_firing: "צריך שריפה",
  fired: "נשרף",
  needs_packing: "צריך אריזה",
  packed: "ארוז",
  needs_delivery: "צריך משלוח/איסוף",
  delivered: "נמסר",
  closed: "סגור",
  follow_up: "המשך טיפול",
  compensation: "צריך פיצוי",
  broken: "נשבר",
  missing: "חסר"
};

export const studioToolStatusColors: Record<StudioToolStatus, string> = {
  photographed: "bg-sky/70 text-sky-950",
  needs_glaze: "bg-lavender/80 text-purple-950",
  glazed: "bg-mint text-emerald-950",
  needs_firing: "bg-coral/25 text-red-950",
  fired: "bg-peach text-orange-950",
  needs_packing: "bg-sand text-yellow-950",
  packed: "bg-mint text-emerald-950",
  needs_delivery: "bg-blush/70 text-rose-950",
  delivered: "bg-emerald-100 text-emerald-900",
  closed: "bg-stone-200 text-stone-800",
  follow_up: "bg-peach text-orange-950",
  compensation: "bg-red-100 text-red-900",
  broken: "bg-red-100 text-red-900",
  missing: "bg-red-100 text-red-900"
};

export const studioToolFlow: StudioToolStatus[] = [
  "photographed",
  "needs_glaze",
  "glazed",
  "needs_firing",
  "fired",
  "needs_packing",
  "packed",
  "needs_delivery",
  "delivered",
  "closed"
];

export const businessSettings: BusinessSettings = {
  vatRate: 0.18,
  defaultEventHours: 4,
  defaultPaintCost: 120,
  defaultGlazeCost: 90,
  defaultPackagingCost: 80,
  defaultFiringCost: 160,
  defaultLogisticsCost: 220
};

export const seedProducts: Product[] = [
  {
    id: "prod_starter_plate",
    name: "צלחת מנה ראשונה",
    type: "צלחת",
    averageUnitCostExVat: 10,
    recommendedParticipantPriceIncVat: 90,
    supplierName: "Minerco",
    supplierUrl: "",
    imageUrl: "",
    isActive: true
  },
  {
    id: "prod_cup",
    name: "כוס",
    type: "כוס",
    averageUnitCostExVat: 12,
    recommendedParticipantPriceIncVat: 100,
    supplierName: "Minerco",
    supplierUrl: "",
    imageUrl: "",
    isActive: true
  },
  {
    id: "prod_bowl",
    name: "קערת קורנפלקס",
    type: "קערה",
    averageUnitCostExVat: 14,
    recommendedParticipantPriceIncVat: 100,
    supplierName: "Minerco",
    supplierUrl: "",
    imageUrl: "",
    isActive: true
  },
  {
    id: "prod_main_plate",
    name: "צלחת עיקרית",
    type: "צלחת",
    averageUnitCostExVat: 18,
    recommendedParticipantPriceIncVat: 120,
    supplierName: "Minerco",
    supplierUrl: "",
    imageUrl: "",
    isActive: true
  }
];

export const seedEmployees: Employee[] = [
  { id: "emp_alona", name: "אלונה", role: "בעלים", hourlyRate: 0, phone: "", isActive: true, notes: "מנהלת את מנותו" },
  { id: "emp_shaked", name: "שקד", role: "עובדת", hourlyRate: 55, phone: "", isActive: true, notes: "" },
  { id: "emp_amit", name: "עמית", role: "עובדת", hourlyRate: 55, phone: "", isActive: true, notes: "" }
];

export const seedClients: Client[] = [
  {
    id: "client_luma",
    name: "לומה הייטק",
    contactName: "מאיה",
    phone: "052-441-0091",
    email: "maya@example.com",
    clientType: "company",
    clientStatus: "booked",
    notes: "יום גיבוש לצוות מוצר, יש מים ושולחנות במקום."
  },
  {
    id: "client_therapy",
    name: "מרכז נועם",
    contactName: "רוני",
    phone: "054-923-7711",
    email: "roni@example.com",
    clientType: "therapy_center",
    clientStatus: "proposal",
    notes: "קבוצה טיפולית רגועה, לבוא עם עוד זמן להסבר."
  },
  {
    id: "client_private",
    name: "משפחת לוי",
    contactName: "דנה",
    phone: "050-234-4412",
    email: "dana@example.com",
    clientType: "private",
    clientStatus: "interested",
    notes: "יום הולדת 10 בחצר."
  }
];

export const seedEvents: Event[] = [
  {
    id: "event_101",
    title: "סדנת צוות מוצר",
    clientId: "client_luma",
    contactName: "מאיה",
    contactPhone: "052-441-0091",
    date: "2026-06-08",
    startTime: "10:00",
    endTime: "14:00",
    address: "משרדי לומה, תל אביב",
    hasTables: true,
    hasChairs: true,
    participantCount: 28,
    eventType: "company",
    customEventType: "גיבוש צוות",
    eventDescription: "סדנה קלילה לצוות אחרי רבעון עמוס, עם דגש על חוויה משותפת.",
    status: "preparing",
    items: [
      {
        id: "event_item_101",
        productId: "prod_starter_plate",
        quantity: 28,
        pricePerItemIncVat: 95,
        unitCostExVat: 10
      }
    ],
    eventHours: 4,
    assignments: [
      { employeeId: "emp_alona", eventHours: 4 },
      { employeeId: "emp_shaked", eventHours: 4 }
    ],
    expenses: { paintCost: 0, glazeCost: 0, packagingCost: 0, firingCost: 0, logisticsCost: 0, arrivalCost: 80, deliveryCost: 140 },
    internalNotes: "להביא דוגמאות מוכנות לצוות מוצר."
  },
  {
    id: "event_102",
    title: "מפגש מרכז נועם",
    clientId: "client_therapy",
    contactName: "רוני",
    contactPhone: "054-923-7711",
    date: "2026-06-12",
    startTime: "17:00",
    endTime: "21:00",
    address: "מרכז נועם, רעננה",
    hasTables: true,
    hasChairs: true,
    participantCount: 18,
    eventType: "therapy_center",
    customEventType: "מפגש טיפולי",
    eventDescription: "קבוצה קטנה, חשוב לשמור על קצב איטי ומרחב אישי.",
    status: "quote_sent",
    items: [
      {
        id: "event_item_102",
        productId: "prod_cup",
        quantity: 18,
        pricePerItemIncVat: 100,
        unitCostExVat: 12
      }
    ],
    eventHours: 4,
    assignments: [{ employeeId: "emp_alona", eventHours: 4 }],
    expenses: { paintCost: 0, glazeCost: 0, packagingCost: 0, firingCost: 0, logisticsCost: 0, arrivalCost: 60, deliveryCost: 80 },
    internalNotes: ""
  }
];

export const seedQuotes: Quote[] = [
  {
    id: "quote_101",
    clientId: "client_therapy",
    eventId: "event_102",
    items: [
      {
        id: "quote_item_101",
        productId: "prod_cup",
        quantity: 18,
        pricePerParticipantIncVat: 100,
        unitCostExVat: 12
      }
    ],
    staffCount: 1,
    employeeId: "emp_alona",
    employeeHours: 4,
    employeeHourlyRate: 0,
    paintCost: 0,
    glazeCost: 0,
    packagingCost: 0,
    firingCost: 0,
    logisticsCost: 140,
    status: "sent",
    createdAt: "2026-06-02"
  }
];

export const seedInventory: InventoryItem[] = [
  { id: "inv_1", productId: "prod_starter_plate", quantityOnHand: 82, quantityReserved: 28, reorderThreshold: 30, averageUnitCostExVat: 10 },
  { id: "inv_2", productId: "prod_cup", quantityOnHand: 46, quantityReserved: 18, reorderThreshold: 35, averageUnitCostExVat: 12 },
  { id: "inv_3", productId: "prod_bowl", quantityOnHand: 29, quantityReserved: 0, reorderThreshold: 30, averageUnitCostExVat: 14 },
  { id: "inv_4", productId: "prod_main_plate", quantityOnHand: 55, quantityReserved: 0, reorderThreshold: 25, averageUnitCostExVat: 18 }
];

export const seedStudioTasks: StudioTask[] = [
  { id: "task_1", title: "לספור עבודות", eventId: "event_102", status: "open", dueDate: "2026-06-13" }
];

export const seedStudioToolPhotos: StudioToolPhoto[] = [];

export const seedSupplierProducts: SupplierProduct[] = [
  {
    id: "supplier_1",
    supplierName: "Minerco",
    supplierProductName: "צלחת קרמיקה 20 ס״מ",
    supplierCategory: "כלים לצביעה",
    productUrl: "https://example.com/minerco-plate",
    priceIncVat: 11.8,
    priceExVat: 10,
    vatRate: 0.18,
    matchedProductId: "prod_starter_plate",
    lastCheckedAt: "2026-06-01"
  }
];

export const seedData: StudioData = {
  clients: seedClients,
  products: seedProducts,
  employees: seedEmployees,
  events: seedEvents,
  quotes: seedQuotes,
  inventory: seedInventory,
  studioTasks: seedStudioTasks,
  studioToolPhotos: seedStudioToolPhotos,
  supplierProducts: seedSupplierProducts,
  businessSettings,
  dailySupportMessages: ["היום לא צריך להספיק הכל. מספיק לסדר את הדבר הבא על השולחן, ואז להמשיך משם."]
};
