import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="p-6">
      <header className="mb-4 border-b border-[#E5E7EB] pb-4">
        <h2 className="text-lg font-semibold text-[#1F3A5F]">{title}</h2>
        {description ? <p className="mt-2 text-sm text-[#6B7280]">{description}</p> : null}
      </header>
      {children}
    </Card>
  );
}
