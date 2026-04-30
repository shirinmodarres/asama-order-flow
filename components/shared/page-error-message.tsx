import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PageErrorMessageProps {
  title?: string;
  message: string;
}

export function PageErrorMessage({
  title = "خطا",
  message,
}: PageErrorMessageProps) {
  return (
    <Card className="border-[#F4C7C7] bg-[#FFF7F7] p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-[#F4C7C7] bg-white text-[#8F2C2C]">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#7B2525]">{title}</p>
          <p className="mt-1 text-sm leading-7 text-[#8F2C2C]">{message}</p>
        </div>
      </div>
    </Card>
  );
}
