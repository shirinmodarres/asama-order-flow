"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarItem } from "@/lib/types";

interface SidebarProps {
  roleTitle: string;
  items: SidebarItem[];
}

export function Sidebar({ roleTitle, items }: SidebarProps) {
  const pathname = usePathname();
  const activeHref = getActiveItemHref(items, pathname);

  return (
    <aside className="h-full w-full max-w-[292px] border-l border-[#E5E7EB] bg-[#F8FAFC] p-5">
      <div className="mb-7 rounded-[12px] border border-[#D9DEE5] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <p className="text-[11px] tracking-wide text-[#6B7280]">
          سامانه توزیع لوازم خانگی
        </p>
        <p className="mt-2 text-sm font-semibold text-[#1F3A5F]">{roleTitle}</p>
        <span className="mt-3 inline-flex rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[11px] text-[#6B7280]">
          نقش فعال
        </span>
      </div>

      <nav className="space-y-2.5">
        {items.map((item) => {
          const isActive = activeHref === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2 rounded-[12px] border px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "border-[#1F3A5F] bg-[#1F3A5F] text-white"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#CCD5E1] hover:text-[#1F3A5F]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-[#9CA3AF]"}`}
              />
              <span className={`${isActive ? "text-white" : "text-[#6B7280]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function isSidebarItemActive(
  itemHref: string,
  pathname: string,
): boolean {
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

function getActiveItemHref(
  items: SidebarItem[],
  pathname: string,
): string | null {
  const matches = items.filter((item) =>
    isSidebarItemActive(item.href, pathname),
  );

  if (matches.length === 0) {
    return null;
  }

  // The longest matching href is the most specific menu item (e.g. /expert/orders/new over /expert).
  return matches.sort((a, b) => b.href.length - a.href.length)[0].href;
}
