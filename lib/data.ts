import type {
  BusinessSettings,
  Client,
  Employee,
  Event,
  EventStatus,
  InventoryItem,
  Product,
  Quote,
  StudioTask,
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

export const businessSettings: BusinessSettings = {
  vatRate: 0.18,
  defaultEventHours: 4,
  defaultPaintCost: 120,
  defaultGlazeCost: 90,
  defaultPackagingCost: 80,
  defaultFiringCost: 160,
  defaultLogisticsCost: 220
};

export const employees: Employee[] = [
  { id: "emp_alona", name: "אלונה", role: "owner", hourlyRate: 0 },
  { id: "emp_shaked", name: "שקד", role: "employee", hourlyRate: 55 },
  { id: "emp_amit", name: "עמית", role: "employee", hourlyRate: 55 }
];

export const products: Product[] = [
  { id: "prod_starter_plate", name: "צלחת מנה ראשונה", defaultUnitCostExVat: 10, defaultParticipantPriceIncVat: 90 },
  { id: "prod_cup", name: "כוס", defaultUnitCostExVat: 12, defaultParticipantPriceIncVat: 100 },
  { id: "prod_bowl", name: "קערת קורנפלקס", defaultUnitCostExVat: 14, defaultParticipantPriceIncVat: 100 },
  { id: "prod_main_plate", name: "צלחת עיקרית", defaultUnitCostExVat: 18, defaultParticipantPriceIncVat: 120 }
];

export const clients: Client[] = [
  {
    id: "client_luma",
    name: "לומה הייטק",
    contactName: "מאיה",
    phone: "052-441-0091",
    city: "תל אביב",
    notes: "יום גיבוש לצוות מוצר, יש מים ושולחנות במקום."
  },
  {
    id: "client_therapy",
    name: "מרכז נועם",
    contactName: "רוני",
    phone: "054-923-7711",
    city: "רעננה",
    notes: "קבוצה טיפולית רגועה, לבוא עם עוד זמן להסבר."
  },
  {
    id: "client_private",
    name: "משפחת לוי",
    contactName: "דנה",
    phone: "050-234-4412",
    city: "גבעתיים",
    notes: "יום הולדת 10 בחצר."
  }
];

export const events: Event[] = [
  {
    id: "event_101",
    title: "סדנת צוות מוצר",
    clientId: "client_luma",
    date: "2026-06-08",
    time: "10:00",
    city: "תל אביב",
    venue: "משרדי לומה",
    participantCount: 28,
    eventType: "company",
    customEventType: "גיבוש צוות",
    eventDescription: "סדנה קלילה לצוות אחרי רבעון עמוס, עם דגש על חוויה משותפת.",
    status: "preparing",
    productId: "prod_starter_plate",
    participantPriceIncVat: 95,
    eventHours: 4,
    assignments: [
      { employeeId: "emp_alona", eventHours: 4 },
      { employeeId: "emp_shaked", eventHours: 4 }
    ],
    expenses: { paintCost: 120, glazeCost: 90, packagingCost: 80, firingCost: 160, logisticsCost: 220 }
  },
  {
    id: "event_102",
    title: "מפגש מרכז נועם",
    clientId: "client_therapy",
    date: "2026-06-12",
    time: "17:00",
    city: "רעננה",
    venue: "מרכז נועם",
    participantCount: 18,
    eventType: "therapy_center",
    customEventType: "מפגש טיפולי",
    eventDescription: "קבוצה קטנה, חשוב לשמור על קצב איטי ומרחב אישי.",
    status: "quote_sent",
    productId: "prod_cup",
    participantPriceIncVat: 100,
    eventHours: 4,
    assignments: [{ employeeId: "emp_alona", eventHours: 4 }],
    expenses: { paintCost: 95, glazeCost: 70, packagingCost: 55, firingCost: 115, logisticsCost: 140 }
  },
  {
    id: "event_103",
    title: "יום הולדת לדניאל",
    clientId: "client_private",
    date: "2026-06-18",
    time: "16:30",
    city: "גבעתיים",
    venue: "בית משפחת לוי",
    participantCount: 22,
    eventType: "birthday",
    customEventType: "יום הולדת",
    eventDescription: "ילדות וילדים בגיל 10, עדיף להביא דוגמאות צבעוניות.",
    status: "lead",
    productId: "prod_bowl",
    participantPriceIncVat: 105,
    eventHours: 4,
    assignments: [{ employeeId: "emp_alona", eventHours: 4 }],
    expenses: { paintCost: 105, glazeCost: 85, packagingCost: 70, firingCost: 140, logisticsCost: 120 }
  },
  {
    id: "event_104",
    title: "סדנת קהילה",
    clientId: "client_luma",
    date: "2026-05-30",
    time: "11:00",
    city: "יפו",
    venue: "מתנ״ס שכונתי",
    participantCount: 35,
    eventType: "community",
    customEventType: "אירוע קהילה",
    eventDescription: "האירוע התקיים, הכלים מחכים לגלזורה ושריפה.",
    status: "glazing",
    productId: "prod_main_plate",
    participantPriceIncVat: 120,
    eventHours: 4,
    assignments: [
      { employeeId: "emp_alona", eventHours: 4 },
      { employeeId: "emp_amit", eventHours: 4 }
    ],
    expenses: { paintCost: 155, glazeCost: 125, packagingCost: 90, firingCost: 220, logisticsCost: 240 }
  }
];

export const quotes: Quote[] = [
  { id: "quote_101", eventId: "event_102", status: "sent", createdAt: "2026-06-02" },
  { id: "quote_102", eventId: "event_103", status: "draft", createdAt: "2026-06-04" }
];

export const inventory: InventoryItem[] = [
  { id: "inv_1", productId: "prod_starter_plate", quantityOnHand: 82, quantityReserved: 28, reorderThreshold: 30, averageUnitCostExVat: 10 },
  { id: "inv_2", productId: "prod_cup", quantityOnHand: 46, quantityReserved: 18, reorderThreshold: 35, averageUnitCostExVat: 12 },
  { id: "inv_3", productId: "prod_bowl", quantityOnHand: 29, quantityReserved: 22, reorderThreshold: 30, averageUnitCostExVat: 14 },
  { id: "inv_4", productId: "prod_main_plate", quantityOnHand: 55, quantityReserved: 0, reorderThreshold: 25, averageUnitCostExVat: 18 }
];

export const studioTasks: StudioTask[] = [
  { id: "task_1", title: "לספור עבודות", eventId: "event_104", status: "done", dueDate: "2026-06-01" },
  { id: "task_2", title: "גלזורה", eventId: "event_104", status: "doing", dueDate: "2026-06-06" },
  { id: "task_3", title: "שריפה", eventId: "event_104", status: "open", dueDate: "2026-06-08" },
  { id: "task_4", title: "בדיקת איכות", eventId: "event_104", status: "open", dueDate: "2026-06-09" },
  { id: "task_5", title: "אריזה", eventId: "event_104", status: "open", dueDate: "2026-06-10" },
  { id: "task_6", title: "תיאום החזרה ללקוח", eventId: "event_104", status: "open", dueDate: "2026-06-11" }
];

export const supplierProducts: SupplierProduct[] = [
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

export const dailySupportMessage =
  "היום לא צריך להספיק הכל. מספיק לסדר את הדבר הבא על השולחן, ואז להמשיך משם.";

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function getClient(id: string) {
  return clients.find((client) => client.id === id);
}

export function getEvent(id: string) {
  return events.find((event) => event.id === id);
}

export function getQuote(id: string) {
  return quotes.find((quote) => quote.id === id);
}
