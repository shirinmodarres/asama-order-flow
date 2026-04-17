export function ProductStatusBadge({ status }: { status: "active" | "inactive" }) {
  const className = status === "active" ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#4D7D54]" : "border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]";
  const label = status === "active" ? "فعال" : "غیرفعال";

  return <span className={`inline-flex rounded-[12px] border px-2.5 py-1 text-xs font-medium ${className}`}>{label}</span>;
}
