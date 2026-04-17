import { Card } from "@/components/ui/card";

interface SummaryCardProps {
  label: string;
  value: string;
  hint: string;
}

export function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <Card className="p-6">
      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#1F3A5F]">{value}</p>
      <p className="mt-3 text-xs leading-6 text-[#6B7280]">{hint}</p>
    </Card>
  );
}
