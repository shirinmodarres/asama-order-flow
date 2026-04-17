import type { WarehouseStatus } from "@/lib/expert/types";
import { StatusBadge } from "@/components/shared/status-badge";

export function WarehouseStatusBadge({ status }: { status: WarehouseStatus }) {
  return <StatusBadge type="warehouse" status={status} />;
}
