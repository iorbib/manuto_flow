import { businessSettings } from "./seedData";
import type { Employee, Event, EventExpenseConfig, EventEmployeeAssignment, Product, Quote } from "./types";

export type PricingInput = {
  participantCount: number;
  product: Product;
  pricePerParticipantIncVat: number;
  eventHours: number;
  assignments: EventEmployeeAssignment[];
  employees: Employee[];
  expenses: EventExpenseConfig;
  vatRate?: number;
};

export function calculatePricing(input: PricingInput) {
  const vatRate = input.vatRate ?? businessSettings.vatRate;
  const revenueIncVat = input.participantCount * input.pricePerParticipantIncVat;
  const revenueExVat = revenueIncVat / (1 + vatRate);
  const ceramicCost = input.participantCount * input.product.averageUnitCostExVat;
  const employeeCost = input.assignments.reduce((sum, assignment) => {
    const employee = input.employees.find((item) => item.id === assignment.employeeId);
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
    (input.expenses.arrivalCost ?? 0) +
    (input.expenses.deliveryCost ?? 0) +
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

export function calculateEventPricing(event: Event, employees: Employee[], vatRate = businessSettings.vatRate) {
  const itemsRevenueIncVat = event.items.reduce((sum, item) => sum + item.quantity * item.pricePerItemIncVat, 0);
  const serviceChargesIncVat = (event.expenses.arrivalCost ?? 0) + (event.expenses.deliveryCost ?? 0);
  const revenueIncVat = itemsRevenueIncVat + serviceChargesIncVat;
  const revenueExVat = revenueIncVat / (1 + vatRate);
  const ceramicCost = event.items.reduce((sum, item) => sum + item.quantity * item.unitCostExVat, 0);
  const employeeCost = event.assignments.reduce((sum, assignment) => {
    const employee = employees.find((item) => item.id === assignment.employeeId);
    return sum + assignment.eventHours * (employee?.hourlyRate ?? 0);
  }, 0);
  const directCosts = ceramicCost + employeeCost + (event.expenses.extraExpenses ?? 0);
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

export function calculateQuotePricing(quote: Quote, vatRate = businessSettings.vatRate) {
  const itemsRevenueIncVat = quote.items.reduce((sum, item) => sum + item.quantity * item.pricePerParticipantIncVat, 0);
  const revenueIncVat = itemsRevenueIncVat + quote.logisticsCost;
  const revenueExVat = revenueIncVat / (1 + vatRate);
  const ceramicCost = quote.items.reduce((sum, item) => sum + item.quantity * item.unitCostExVat, 0);
  const employeeCost = quote.employeeHours * quote.employeeHourlyRate;
  const directCosts = ceramicCost + employeeCost;
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
