import type { ReactNode } from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { sidebarByRole } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

interface DashboardLayoutProps {
  role: RoleKey;
  title: string;
  children: ReactNode;
}

export function DashboardLayout({ role, title, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1540px] flex-col gap-6 px-4 py-5 xl:flex-row xl:px-6 xl:py-6">
        <Sidebar items={sidebarByRole[role]} />

        <main className="min-w-0 flex-1">
          <Header title={title} role={role} />
          <div className="mt-6 space-y-6 pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
