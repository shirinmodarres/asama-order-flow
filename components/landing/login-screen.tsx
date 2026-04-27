"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BriefcaseBusiness,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Workflow,
} from "lucide-react";
import { AsamaLogo } from "@/components/branding/asama-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { roles, rolesByKey } from "@/lib/mock-data";
import type { RoleKey } from "@/lib/types";

const infoItems = [
  {
    title: "دسترسی متناسب با هر نقش",
    icon: ShieldCheck,
  },
  {
    title: "گردش هماهنگ از سفارش تا صورتحساب",
    icon: Workflow,
  },
  {
    title: "مناسب برای استفاده تیم های عملیاتی",
    icon: BriefcaseBusiness,
  },
];

export function LoginScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleKey>("expert");
  const [username, setUsername] = useState(rolesByKey.expert.userName);
  const [password, setPassword] = useState("123456");
  const currentRole = rolesByKey[selectedRole];

  const handleRoleChange = (roleKey: RoleKey) => {
    setSelectedRole(roleKey);
    setUsername(rolesByKey[roleKey].userName);
    localStorage.setItem("asama-demo-role", roleKey);
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,58,95,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(108,174,117,0.1),transparent_26%)]" />

      <main className="relative mx-auto grid w-full max-w-[1320px] gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <section className="rounded-[30px] border border-[#D7E0E8] bg-white/95 p-6 shadow-[0_34px_90px_rgba(15,23,42,0.1)] backdrop-blur xl:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <AsamaLogo href="/" />
            <Badge variant="neutral" dot>
              درگاه ورود کاربران
            </Badge>
          </div>

          <div className="mt-10 max-w-xl">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#6B7280]">
              نقطه ورود یکپارچه
            </p>
            <h1 className="mt-4 max-w-[30rem] text-2xl font-bold leading-[1.8] text-[#102034] lg:text-[2rem]">
              درگاه ورود کاربران سامانه داخلی آساما
            </h1>
            <p className="mt-4 text-base leading-8 text-[#5F6E81]">
              از این درگاه، واحدهای فروش، انبار، مالی و پشتیبانی به محیط کاری
              خود دسترسی پیدا می کنند. ساختار صفحه برای ورود سریع، تشخیص روشن
              نقش و شروع کار روزانه طراحی شده است.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            {infoItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-[20px] border border-[#DDEAE0] bg-white/90 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[#D6E8DA] bg-[#F3FAF4] text-[#6CAE75]">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[#102034]">
                    {item.title}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D7E0E8] bg-white/95 p-6 shadow-[0_34px_90px_rgba(15,23,42,0.1)] backdrop-blur xl:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="success">ورود به سامانه</Badge>
              <h2 className="mt-4 text-2xl font-bold text-[#102034]">
                ورود به حساب کاربری
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                نام کاربری، گذرواژه و نقش سازمانی را وارد کنید. دسترسی شما پس از
                ورود بر اساس همین نقش تنظیم می شود.
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl border border-[#D6E8DA] bg-[#F3FAF4] text-[#6CAE75]">
              <LockKeyhole className="size-5" />
            </div>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              localStorage.setItem("asama-demo-role", currentRole.key);
              router.push(currentRole.path);
            }}
          >
            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>نام کاربری</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#6CAE75]" />
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>گذرواژه</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#6CAE75]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>نقش ورود</span>
              <SearchableSelect
                value={selectedRole}
                onValueChange={(value) => handleRoleChange(value as RoleKey)}
                options={roles.map((role) => ({
                  value: role.key,
                  label: role.title,
                }))}
                placeholder="انتخاب نقش"
                searchPlaceholder="جستجو در نقش ها"
                emptyMessage="نقشی پیدا نشد"
                triggerClassName="border-[#D6E2D9] bg-[#FBFDFC]"
              />
            </label>

            <Button type="submit" variant="success" fullWidth size="lg">
              ورود به سامانه
            </Button>
          </form>

          {/* <div className="mt-6 rounded-[20px] bg-[#F7FBF8] px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#315D3D]">
              <ShieldCheck className="size-4" />
              نقش انتخاب شده
            </div>
            <p className="mt-2 text-sm font-semibold text-[#102034]">
              {currentRole.title}
            </p>
            <p className="mt-1 text-sm leading-7 text-[#6B7280]">
              {currentRole.entrySummary}
            </p>
          </div> */}
        </section>
      </main>
    </div>
  );
}
