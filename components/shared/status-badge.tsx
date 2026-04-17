import { orderStatusLabel, warehouseStatusLabel } from "@/lib/expert/mock-data";
import type { OrderStatus, WarehouseStatus } from "@/lib/expert/types";

type BadgeType = "order" | "warehouse" | "inventory";
type InventoryStatus = "normal" | "warning" | "critical";

interface StatusBadgeProps {
  type: BadgeType;
  status: OrderStatus | WarehouseStatus | InventoryStatus;
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const { label, className } = getBadgeConfig(type, status);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function getBadgeConfig(type: BadgeType, status: StatusBadgeProps["status"]) {
  if (type === "order") {
    const value = status as OrderStatus;
    if (value === "pending")
      return {
        label: orderStatusLabel[value],
        className: "border-[#F3D8A8] bg-[#FFF8EB] text-[#9A6C18]",
      };
    if (value === "approved")
      return {
        label: orderStatusLabel[value],
        className: "border-[#C5E3CB] bg-[#F3FAF4] text-[#4D7D54]",
      };
    if (value === "cancelled")
      return {
        label: orderStatusLabel[value],
        className: "border-[#F4C8C8] bg-[#FFF3F3] text-[#A23D3D]",
      };
    return {
      label: orderStatusLabel[value],
      className: "border-[#C9D7E8] bg-[#EEF3F8] text-[#1F3A5F]",
    };
  }

  if (type === "warehouse") {
    const value = status as WarehouseStatus;
    if (value === "reserved")
      return {
        label: warehouseStatusLabel[value],
        className: "border-[#D6DCE5] bg-[#F5F7FA] text-[#4B5563]",
      };
    if (value === "reviewing")
      return {
        label: warehouseStatusLabel[value],
        className: "border-[#CBD8E8] bg-[#EEF3F8] text-[#1F3A5F]",
      };
    if (value === "returned")
      return {
        label: warehouseStatusLabel[value],
        className: "border-[#E5E7EB] bg-[#F8FAFC] text-[#6B7280]",
      };
    if (value === "processing")
      return {
        label: warehouseStatusLabel[value],
        className: "border-[#CBD8E8] bg-[#EEF3F8] text-[#1F3A5F]",
      };
    if (value === "dispatchIssued")
      return {
        label: warehouseStatusLabel[value],
        className: "border-[#BFD0E6] bg-[#EAF1F8] text-[#1F3A5F]",
      };
    if (value === "delivered")
      return {
        label: warehouseStatusLabel[value],
        className: "border-[#C5E3CB] bg-[#F3FAF4] text-[#4D7D54]",
      };
    return {
      label: warehouseStatusLabel[value],
      className: "border-[#C9D7E8] bg-[#EEF3F8] text-[#1F3A5F]",
    };
  }

  const inventoryStatus = status as InventoryStatus;
  if (inventoryStatus === "critical") {
    return {
      label: "بحرانی",
      className: "border-[#F4C8C8] bg-[#FFF3F3] text-[#A23D3D]",
    };
  }
  if (inventoryStatus === "warning") {
    return {
      label: "کم",
      className: "border-[#F3D8A8] bg-[#FFF8EB] text-[#9A6C18]",
    };
  }

  return {
    label: "مناسب",
    className: "border-[#C5E3CB] bg-[#F3FAF4] text-[#4D7D54]",
  };
}
