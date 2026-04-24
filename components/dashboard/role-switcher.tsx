"use client";

import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";
import { roles, rolesByKey } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";
import { roleIconMap } from "@/components/shared/app-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSwitcherProps {
  currentRole: RoleKey;
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter();
  const currentRoleInfo = rolesByKey[currentRole];

  return (
    <div className="min-w-[220px]">
      <Select
        value={currentRole}
        onValueChange={(value) => {
          localStorage.setItem("asama-demo-role", value);
          router.push(rolesByKey[value as RoleKey]?.path ?? "/");
        }}
      >
        <SelectTrigger className="h-12 border-[#D6E2D9] bg-[#F8FBF9] pr-3.5 pl-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-[12px] bg-[#F3FAF4] text-[#6CAE75]">
              <ArrowRightLeft className="size-4" />
            </span>
            <div className="min-w-0 text-right">
              <p className="text-[11px] font-semibold tracking-wide text-[#6B7280]">
                تغییر نقش
              </p>
              <SelectValue placeholder={currentRoleInfo.title} />
            </div>
          </div>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => {
            const Icon = roleIconMap[role.icon];

            return (
              <SelectItem key={role.key} value={role.key}>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-[10px] bg-[#F1F5F8] text-[#1F3A5F]">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="text-right">
                    <div className="font-medium">{role.title}</div>
                    <div className="text-[11px] text-[#6B7280]">
                      {role.userName}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
