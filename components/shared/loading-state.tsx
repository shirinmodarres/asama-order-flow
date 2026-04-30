import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "در حال دریافت اطلاعات",
  description = "لطفاً چند لحظه صبر کنید.",
}: LoadingStateProps) {
  return (
    <Card className="p-10 text-center">
      <Loader2 className="mx-auto size-7 animate-spin text-[#1F3A5F]" />
      <p className="mt-4 text-sm font-semibold text-[#102034]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#6B7280]">{description}</p>
    </Card>
  );
}
