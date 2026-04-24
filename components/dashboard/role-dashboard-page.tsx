"use client";

import { ArrowLeft, Clock3, FilePenLine, PlusCircle } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { SummaryCard } from "@/components/ui/summary-card";
import { isOrderEditable } from "@/lib/expert/utils";
import { activityByRole, rolesByKey, statsByRole } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

interface RoleDashboardPageProps {
  role: RoleKey;
}

export function RoleDashboardPage({ role }: RoleDashboardPageProps) {
  const currentRole = rolesByKey[role];
  const stats = statsByRole[role];
  const activities = activityByRole[role];
  const { orders } = useExpertStore();
  const latestEditableOrder =
    role === "expert"
      ? [...orders]
          .filter((order) => isOrderEditable(order))
          .sort(
            (a, b) =>
              Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)),
          )[0]
      : null;

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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard
          title="فعالیت های اخیر"
          description="آخرین رویدادهای ثبت شده در پنل"
        >
          <ul className="space-y-3">
            {activities.map((activity, index) => (
              <li
                key={activity.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-[18px] border border-[#E7EDF3] bg-[#FBFCFD] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 items-center justify-center rounded-[12px] bg-[#EEF4FA] text-[#1F3A5F]">
                    <Clock3 className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm leading-7 text-[#334155]">
                      {activity.text}
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      رویداد {index + 1}
                    </p>
                  </div>
                </div>
                <Badge variant="neutral">{activity.time}</Badge>
              </li>
            ))}
          </ul>
        </SectionCard>

        {role === "expert" ? (
          <SectionCard
            title="دسترسی سریع"
            description="برای  ثبت سفارش یا آخرین سفارش قابل ویرایش"
          >
            <div className="space-y-3">
              <div className="rounded-[18px] border border-[#DDEAE0] bg-[linear-gradient(180deg,rgba(247,251,248,1),rgba(255,255,255,1))] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 items-center justify-center rounded-[14px] bg-[#6CAE75] text-white shadow-[0_14px_28px_rgba(108,174,117,0.22)]">
                    <PlusCircle className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#102034]">
                      ثبت سفارش جدید
                    </div>
                    <p className="mt-1 text-sm leading-7 text-[#6B7280]">
                      سفارش جدید فروش را ثبت کنید.
                    </p>
                  </div>
                </div>
                <Button asChild variant="success" fullWidth className="mt-4">
                  <Link href="/expert/orders/new">
                    ورود به فرم ثبت سفارش
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-[18px] border border-[#E7EDF3] bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 items-center justify-center rounded-[14px] bg-[#EEF4FA] text-[#1F3A5F]">
                    <FilePenLine className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#102034]">
                      ویرایش آخرین سفارش
                    </div>
                    <p className="mt-1 text-sm leading-7 text-[#6B7280]">
                      {latestEditableOrder
                        ? `آخرین سفارش قابل ویرایش شما ${latestEditableOrder.code} است و هنوز در انتظار تایید قرار دارد.`
                        : "در حال حاضر سفارشی با امکان ویرایش وجود ندارد."}
                    </p>
                  </div>
                </div>
                {latestEditableOrder ? (
                  <Button asChild variant="outline" fullWidth className="mt-4">
                    <Link
                      href={`/expert/orders/${latestEditableOrder.id}/edit`}
                    >
                      باز کردن سفارش {latestEditableOrder.code}
                      <ArrowLeft className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" fullWidth className="mt-4" disabled>
                    سفارشی برای ویرایش موجود نیست
                  </Button>
                )}
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="پروفایل نقش"
            description="خلاصه نقش فعال در نسخه نمایشی"
          >
            <div className="space-y-3">
              <div className="rounded-[18px] border border-[#E7EDF3] bg-[#F8FBFD] p-4">
                <div className="text-xs font-semibold tracking-wide text-[#6B7280]">
                  کاربر فعال
                </div>
                <div className="mt-2 text-base font-semibold text-[#102034]">
                  {currentRole.userName}
                </div>
                <div className="mt-1 text-sm text-[#6B7280]">
                  {currentRole.team}
                </div>
              </div>
              <div className="rounded-[18px] border border-[#E7EDF3] bg-white p-4 text-sm leading-7 text-[#6B7280]">
                {currentRole.entrySummary}
              </div>
            </div>
          </SectionCard>
        )}
      </section>
    </DashboardLayout>
  );
}
