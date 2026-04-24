"use client";

import { Bell, ChevronLeft, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { AsamaLogo } from "@/components/branding/asama-logo";
import { RoleSwitcher } from "@/components/dashboard/role-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rolesByKey, sidebarByRole } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

interface HeaderProps {
  title: string;
  role: RoleKey;
}

export function Header({ title, role }: HeaderProps) {
  const pathname = usePathname();
  const roleInfo = rolesByKey[role];
  const currentSection =
    sidebarByRole[role]
      .filter(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      )
      .sort((a, b) => b.href.length - a.href.length)[0] ?? null;

  return (
    <header className="sticky top-4 z-20 rounded-[22px] border border-[#DDE5ED] bg-white/90 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <AsamaLogo compact />
          <div className="min-w-0">
            <h1 className="mt-3 truncate text-2xl font-black tracking-tight text-[#102034]">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-7 text-[#6B7280]">
              {currentSection?.description ?? roleInfo.entrySummary}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* <RoleSwitcher currentRole={role} /> */}

          <div className="flex items-center gap-3 rounded-[16px] border border-[#D8E1EA] bg-[#F8FBFD] px-3 py-2.5">
            <Avatar>
              <AvatarFallback>{roleInfo.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <div className="text-sm font-semibold text-[#102034]">
                {roleInfo.userName}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <span>{roleInfo.title}</span>
                <ChevronLeft className="size-3.5" />
                <span>کاربر دمو</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="اعلان ها"
            className="relative rounded-[14px]"
          >
            <Bell className="size-4 text-[#1F3A5F]" />
            <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-[#1F3A5F] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              ۳
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
