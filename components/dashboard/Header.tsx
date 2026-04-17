"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { roles } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

interface HeaderProps {
  title: string;
  role: RoleKey;
}

export function Header({ title, role }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 rounded-xl border border-[#E5E7EB] border-b-[#E5E7EB] bg-white px-4 md:px-6">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-9 w-[108px] items-center justify-center  bg-white px-2">
            <Image
              src="/logo-fn.png"
              alt="لوگوی آساما"
              width={96}
              height={28}
              className="h-auto w-full object-contain"
              priority
            />
          </span>
        </div>

        <h1 className="hidden flex-1 truncate px-4 text-center text-base font-medium text-[#1F3A5F] lg:block">
          {title}
        </h1>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-2.5 py-1.5 transition-colors hover:border-[#CAD2DC]">
            <select
              aria-label="انتخاب نقش"
              value={role}
              onChange={(event) => {
                const selectedRole = roles.find(
                  (item) => item.key === (event.target.value as RoleKey),
                );
                router.push(selectedRole?.path ?? "/");
              }}
              className="cursor-pointer rounded-[10px] bg-transparent px-1.5 py-1 text-xs font-medium text-[#1F3A5F] outline-none"
            >
              {roles.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            aria-label="اعلان ها"
            className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#1F3A5F] transition-colors hover:border-[#CAD2DC] hover:bg-[#F8FAFC]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden
            >
              <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h11Z" />
              <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
            </svg>
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1F3A5F] px-1 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-right transition-colors hover:border-[#CAD2DC]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1F3A5F] text-[11px] font-semibold text-white">
              ع
            </span>
            <span className="hidden text-xs font-medium text-[#1F3A5F] md:inline">
              علی رضایی
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
