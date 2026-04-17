import type { ReactNode } from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { rolesByKey, sidebarByRole } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

interface DashboardLayoutProps {
  role: RoleKey;
  title: string;
  children: ReactNode;
}

export function DashboardLayout({ role, title, children }: DashboardLayoutProps) {
  const currentRole = rolesByKey[role];

  return (
    <div className="min-h-screen bg-[#F3F5F8]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-row-reverse gap-0 px-4 py-6 lg:px-6">
        <Sidebar roleTitle={currentRole.title} items={sidebarByRole[role]} />

        <main className="flex-1 px-0 lg:px-6">
          <Header title={title} role={role} />
          <div className="mt-6 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
