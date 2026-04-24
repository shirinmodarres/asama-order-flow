import { orderStatusLabel, warehouseStatusLabel } from "@/lib/expert/mock-data";
import type { OrderStatus, WarehouseStatus } from "@/lib/expert/types";
import { Badge } from "@/components/ui/badge";

type BadgeType = "order" | "warehouse" | "inventory";
type InventoryStatus = "normal" | "warning" | "critical";

interface StatusBadgeProps {
  type: BadgeType;
  status: OrderStatus | WarehouseStatus | InventoryStatus;
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const { label, variant } = getBadgeConfig(type, status);

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}

function getBadgeConfig(type: BadgeType, status: StatusBadgeProps["status"]) {
  if (type === "order") {
    const value = status as OrderStatus;
    if (value === "pending")
      return {
        label: orderStatusLabel[value],
        variant: "warning" as const,
      };
    if (value === "approved")
      return {
        label: orderStatusLabel[value],
        variant: "success" as const,
      };
    if (value === "cancelled")
      return {
        label: orderStatusLabel[value],
        variant: "destructive" as const,
      };
    return {
      label: orderStatusLabel[value],
      variant: "brand" as const,
    };
  }

  if (type === "warehouse") {
    const value = status as WarehouseStatus;
    if (value === "reserved")
      return {
        label: warehouseStatusLabel[value],
        variant: "neutral" as const,
      };
    if (value === "reviewing")
      return {
        label: warehouseStatusLabel[value],
        variant: "brand" as const,
      };
    if (value === "returned")
      return {
        label: warehouseStatusLabel[value],
        variant: "neutral" as const,
      };
    if (value === "processing")
      return {
        label: warehouseStatusLabel[value],
        variant: "brand" as const,
      };
    if (value === "dispatchIssued")
      return {
        label: warehouseStatusLabel[value],
        variant: "brand" as const,
      };
    if (value === "delivered")
      return {
        label: warehouseStatusLabel[value],
        variant: "success" as const,
      };
    if (value === "awaitingNajaDetails")
      return {
        label: warehouseStatusLabel[value],
        variant: "warning" as const,
      };
    if (value === "najaDetailsCompleted")
      return {
        label: warehouseStatusLabel[value],
        variant: "success" as const,
      };
    return {
      label: warehouseStatusLabel[value],
      variant: "brand" as const,
    };
  }

  const inventoryStatus = status as InventoryStatus;
  if (inventoryStatus === "critical") {
    return {
      label: "بحرانی",
      variant: "destructive" as const,
    };
  }
  if (inventoryStatus === "warning") {
    return {
      label: "کم",
      variant: "warning" as const,
    };
  }

  return {
    label: "مناسب",
    variant: "success" as const,
  };
}
