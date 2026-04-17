import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SectionCard } from "@/components/ui/section-card";
import { SummaryCard } from "@/components/ui/summary-card";
import { activityByRole, rolesByKey, statsByRole } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

interface RoleDashboardPageProps {
  role: RoleKey;
}

export function RoleDashboardPage({ role }: RoleDashboardPageProps) {
  const currentRole = rolesByKey[role];
  const stats = statsByRole[role];
  const activities = activityByRole[role];

  return (
    <DashboardLayout role={role} title={`داشبورد ${currentRole.title}`}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <SummaryCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
          />
        ))}
      </section>

      <SectionCard
        title="فعالیت های اخیر"
        description="آخرین رویدادهای ثبت شده در پنل"
      >
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] p-4"
            >
              <p className="text-sm text-[#374151]">{activity.text}</p>
              <span className="text-xs text-[#6B7280]">{activity.time}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </DashboardLayout>
  );
}
