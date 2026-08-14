import type { ExpertOrder, OrderItem, Product } from "@/lib/expert/types";
import {
  formatFaCurrency,
  formatFaNumber,
} from "@/lib/utils/number-format";
import { formatJalaliDate, formatJalaliDateTime } from "@/lib/utils/date-format";
import {
  getOrderTotalAmount as getOrderSalesAmount,
  getOrderTotalQuantity as getOrderSalesQuantity,
} from "@/lib/reports/order-sales-metrics";

const textCollator = (() => {
  try {
    return new Intl.Collator("fa", { sensitivity: "base", numeric: true });
  } catch {
    try {
      return new Intl.Collator(undefined, {
        sensitivity: "base",
        numeric: true,
      });
    } catch {
      return null;
    }
  }
})();

export function formatNumber(value?: number | string | null): string {
  return formatFaNumber(value);
}

export function formatCurrency(value?: number | string | null): string {
  return formatFaCurrency(value);
}

export function formatFaCurrencywithoutRial(value?: number | string | null): string {
  return formatFaCurrencywithoutRial(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  return formatJalaliDate(value);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatJalaliDateTime(value);
}

export function isOrderEditable(order: ExpertOrder): boolean {
  return (
    order.status === "pending_financial_approval" ||
    order.status === "needs_review"
  );
}

export function getAvailableStock(product: Product): number {
  return Math.max(
    product.availableForSale ??
      product.availableStock ??
      (product.salesStock ?? product.totalStock) - product.reservedStock,
    0,
  );
}

export function getNajaAvailableStock(product: Product): number {
  return Math.max(product.najaInventoryQty, 0);
}

export function getOrderItemCount(items: OrderItem[]): number {
  return items.length;
}

export function getOrderTotalQuantity(items: OrderItem[]): number {
  return getOrderSalesQuantity(items);
}

export function getOrderLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function getOrderTotalAmount(
  items: OrderItem[],
  productsById: Record<string, Product | undefined>,
): number {
  if (Object.keys(productsById).length === 0) {
    return getOrderSalesAmount(items);
  }

  return items.reduce((sum, item) => {
    const product = productsById[item.productId];
    return sum + getOrderLineTotal(item.quantity, product?.unitPrice ?? 0);
  }, 0);
}

export function mergeOrderItems(items: OrderItem[]): OrderItem[] {
  const map = new Map<string, number>();

  for (const item of items) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function compareText(a: string, b: string): number {
  if (textCollator) return textCollator.compare(a, b);

  try {
    return a.localeCompare(b);
  } catch {
    if (a === b) return 0;
    return a > b ? 1 : -1;
  }
}
