import { RoleCard } from "@/components/landing/role-card";
import { roles } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F3F5F8] px-4 py-10 lg:px-8">
      <main className="mx-auto w-full max-w-[1240px]">
        <section className="mb-8 rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] lg:p-8">
          <p className="text-sm text-[#6B7280]">سامانه داخلی توزیع و عملیات لوازم خانگی</p>
          <h1 className="mt-2 text-2xl font-bold text-[#1F3A5F] lg:text-3xl">انتخاب نقش برای ورود به پنل سازمانی</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6B7280]">
            این نسخه نمایشی برای نمایش گردش کار داخلی سفارش، انبار، مالی و پشتیبانی در شبکه توزیع لوازم خانگی طراحی شده است.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <RoleCard key={role.key} role={role} />
          ))}
        </section>
      </main>
    </div>
  );
}
