export interface OrderSalesSummary {
  totalQuantity: number;
  totalAmount: number;
}

export interface OrderSalesItemLike {
  quantity: number;
  unitPrice?: number;
}

/**
 * Sales math source of truth:
 * - quantity comes from each order item's quantity
 * - amount comes from quantity * unitPrice for each order item
 *
 * Keep this file as the single place where sales totals are defined so all
 * dashboards and reports stay aligned.
 */
export function getOrderSalesSummary(
  items: OrderSalesItemLike[],
): OrderSalesSummary {
  return items.reduce<OrderSalesSummary>(
    (summary, item) => {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unitPrice ?? 0);

      summary.totalQuantity += quantity;
      summary.totalAmount += quantity * unitPrice;

      return summary;
    },
    { totalQuantity: 0, totalAmount: 0 },
  );
}

export function getOrderTotalQuantity(
  items: OrderSalesItemLike[],
): number {
  return getOrderSalesSummary(items).totalQuantity;
}

export function getOrderTotalAmount(
  items: OrderSalesItemLike[],
): number {
  return getOrderSalesSummary(items).totalAmount;
}
