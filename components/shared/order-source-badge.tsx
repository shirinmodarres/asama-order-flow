import { Badge } from "@/components/ui/badge";
import type { OrderSource } from "@/lib/expert/types";

export function OrderSourceBadge({ source }: { source: OrderSource }) {
  if (source === "naja") {
    return <Badge variant="warning">سفارش ناجا</Badge>;
  }

  return <Badge variant="neutral">سفارش عادی</Badge>;
}
