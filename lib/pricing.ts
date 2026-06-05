import { businessSettings, employees, getProduct } from "./data";
import type { Event, EventExpenseConfig, EventEmployeeAssignment, Product } from "./types";

export type PricingInput = {
  participantCount: number;
  product: Product;
  pricePerParticipantIncVat: number;
  eventHours: number;
  assignments: EventEmployeeAssignment[];
  expenses: EventExpenseConfig;
  vatRate?: number;
};

export function calculatePricing(input: PricingInput) {
  const vatRate = input.vatRate ?? businessSettings.vatRate;
  const revenueIncVat = input.participantCount * input.pricePerParticipantIncVat;
  const revenueExVat = revenueIncVat / (1 + vatRate);
  const ceramicCost = input.participantCount * input.product.defaultUnitCostExVat;
  const employeeCost = input.assignments.reduce((sum, assignment) => {
    const employee = employees.find((item) => item.id === assignment.employeeId);
    return sum + assignment.eventHours * (employee?.hourlyRate ?? 0);
  }, 0);
  const directCosts =
    ceramicCost +
    employeeCost +
    input.expenses.paintCost +
    input.expenses.glazeCost +
    input.expenses.packagingCost +
    input.expenses.firingCost +
    input.expenses.logisticsCost +
    (input.expenses.extraExpenses ?? 0);
  const grossProfit = revenueExVat - directCosts;
  const margin = revenueExVat > 0 ? (grossProfit / revenueExVat) * 100 : 0;

  return {
    revenueIncVat,
    revenueExVat,
    ceramicCost,
    employeeCost,
    directCosts,
    grossProfit,
    margin,
    recommendation: getPricingRecommendation(margin)
  };
}

export function calculateEventPricing(event: Event) {
  const product = getProduct(event.productId);
  if (!product) {
    throw new Error(`Missing product for event ${event.id}`);
  }

  return calculatePricing({
    participantCount: event.participantCount,
    product,
    pricePerParticipantIncVat: event.participantPriceIncVat,
    eventHours: event.eventHours,
    assignments: event.assignments,
    expenses: event.expenses
  });
}

function getPricingRecommendation(margin: number) {
  if (margin < 25) {
    return "המחיר עובר, אבל נשאר מעט מקום לעבודה שאחרי הסדנה. אולי שווה לבדוק עוד 10 ₪ למשתתף.";
  }

  if (margin < 40) {
    return "נראה מאוזן. יש מקום לעבודה של הסטודיו בלי שהמחיר מרגיש כבד מדי.";
  }

  return "יפה, יש מספיק אוויר בין עלויות האירוע לבין העבודה שאחרי הסדנה.";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}
