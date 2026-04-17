import type { ExpertOrder, OrderItem, Product } from "@/lib/expert/types";

export function formatNumber(value: number): string {
  return value.toLocaleString("fa-IR");
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fa-IR");
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isOrderEditable(order: ExpertOrder): boolean {
  return order.status === "pending";
}

export function getAvailableStock(product: Product): number {
  return Math.max(product.totalStock - product.reservedStock, 0);
}

export function getOrderItemCount(items: OrderItem[]): number {
  return items.length;
}

export function getOrderTotalQuantity(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function mergeOrderItems(items: OrderItem[]): OrderItem[] {
  const map = new Map<string, number>();

  for (const item of items) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}
