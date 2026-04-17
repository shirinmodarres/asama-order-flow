"use client";

import { useRouter } from "next/navigation";
import { roles } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

interface TopbarProps {
  roleBadge: string;
  pageTitle: string;
  currentRole: RoleKey;
}

export function Topbar({ roleBadge, pageTitle, currentRole }: TopbarProps) {
  const router = useRouter();

  return (
    <header className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#6B7280]">سیستم داخلی توزیع و عملیات فروش</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1F3A5F]">{pageTitle}</h1>
          <p className="mt-1 text-sm text-[#6B7280]">نمای یکپارچه وضعیت و اقدامات ثبت شده</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
            <span className="text-xs text-[#6B7280]">تغییر نقش</span>
            <select
              aria-label="تغییر نقش"
              value={currentRole}
              onChange={(event) => router.push(roles.find((role) => role.key === event.target.value)?.path ?? "/")}
              className="rounded-[10px] border border-[#E5E7EB] bg-white px-2 py-1 text-xs font-medium text-[#1F3A5F] outline-none"
            >
              {roles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.title}
                </option>
              ))}
            </select>
          </div>

          <span className="rounded-[12px] border border-[#CFE3D3] bg-[#F3FAF4] px-3 py-2 text-xs font-semibold text-[#4D7D54]">{roleBadge}</span>
        </div>
      </div>
    </header>
  );
}
