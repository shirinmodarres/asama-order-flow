import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Role } from "@/lib/types";

interface RoleCardProps {
  role: Role;
}

export function RoleCard({ role }: RoleCardProps) {
  return (
    <Card className="flex h-full flex-col p-6">
      <p className="text-xs font-medium text-[#6B7280]">نقش عملیاتی</p>
      <h2 className="mt-1 text-xl font-semibold text-[#1F3A5F]">{role.title}</h2>
      <p className="mt-3 flex-1 text-sm leading-7 text-[#6B7280]">{role.description}</p>

      <Link href={role.path} className="btn-primary mt-6 inline-flex items-center justify-center rounded-[12px] px-4 py-2.5 text-sm font-medium transition-colors">
        ورود به پنل
      </Link>
    </Card>
  );
}
