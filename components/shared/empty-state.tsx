import { FolderOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-[#D6DEE8] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,251,253,1))] p-12 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-[18px] border border-[#DEE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
        <FolderOpen className="size-6" />
      </div>
      <p className="mt-5 text-lg font-semibold text-[#102034]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#6B7280]">{description}</p>
      <p className="mt-4 text-xs leading-6 text-[#9CA3AF]">
        در صورت نیاز فیلترها را بازنشانی کنید یا داده جدید ثبت نمایید.
      </p>
    </Card>
  );
}
