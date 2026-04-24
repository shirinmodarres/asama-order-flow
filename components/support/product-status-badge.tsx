import { Badge } from "@/components/ui/badge";

export function ProductStatusBadge({
  status,
}: {
  status: "active" | "inactive";
}) {
  const label = status === "active" ? "فعال" : "غیرفعال";

  return <Badge variant={status === "active" ? "success" : "neutral"} dot>{label}</Badge>;
}
