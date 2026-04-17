import type { ActivityItem, DashboardStat, Role, RoleKey, SidebarItem } from "@/lib/types";

export const roles: Role[] = [
  {
    key: "expert",
    title: "کارشناس",
    description: "ثبت و پیگیری سفارش های لوازم خانگی و مدیریت رزرو موجودی برای فروش.",
    path: "/expert",
    badge: "کارشناس | علی رضایی",
  },
  {
    key: "manager",
    title: "مدیر فروش",
    description: "تصمیم گیری نهایی سفارش های در انتظار تایید و هدایت جریان عملیاتی فروش.",
    path: "/manager",
    badge: "مدیر فروش | محمد کاظمی",
  },
  {
    key: "warehouse",
    title: "انباردار",
    description: "بررسی سفارش تاییدشده، صدور حواله خروج و ثبت تحویل نهایی به مشتری.",
    path: "/warehouse",
    badge: "انباردار | رضا احمدی",
  },
  {
    key: "finance",
    title: "حسابداری",
    description: "کنترل سفارش های تحویل شده و نهایی سازی مالی با صدور فاکتور داخلی.",
    path: "/finance",
    badge: "حسابداری | مریم نادری",
  },
  {
    key: "support",
    title: "پشتیبان",
    description: "نگهداری داده های پایه، مدیریت موجودی و ویرایش ویژه سفارش در شرایط خاص.",
    path: "/support",
    badge: "پشتیبان | سارا کریمی",
  },
];

export const rolesByKey: Record<RoleKey, Role> = roles.reduce(
  (accumulator, role) => {
    accumulator[role.key] = role;
    return accumulator;
  },
  {} as Record<RoleKey, Role>,
);

export const sidebarByRole: Record<RoleKey, SidebarItem[]> = {
  expert: [
    { label: "داشبورد", href: "/expert" },
    { label: "موجودی", href: "/expert/inventory" },
    { label: "سفارش ها", href: "/expert/orders" },
    { label: "ثبت سفارش", href: "/expert/orders/new" },
  ],
  manager: [
    { label: "داشبورد", href: "/manager" },
    { label: "سفارش های در انتظار تأیید", href: "/manager/pending-orders" },
    { label: "روند سفارش ها", href: "/manager/order-tracking" },
  ],
  warehouse: [
    { label: "داشبورد", href: "/warehouse" },
    { label: "سفارش های تأییدشده", href: "/warehouse/orders" },
    { label: "حواله های خروج", href: "/warehouse/exit-slips" },
    { label: "سفارش های تحویل شده", href: "/warehouse/delivered" },
  ],
  finance: [
    { label: "داشبورد", href: "/finance" },
    { label: "آماده فاکتور", href: "/finance/ready" },
    { label: "فاکتورها", href: "/finance/invoices" },
  ],
  support: [
    { label: "داشبورد", href: "/support" },
    { label: "کالاها", href: "/support/products" },
    { label: "موجودی", href: "/support/inventory" },
    { label: "تاریخچه موجودی", href: "/support/inventory-history" },
    { label: "ویرایش سفارش", href: "/support/orders" },
  ],
};

export const statsByRole: Record<RoleKey, DashboardStat[]> = {
  expert: [
    { id: "1", label: "سفارش های امروز", value: "۱۸", hint: "سفارش ترکیبی یخچال، لباسشویی و جاروبرقی" },
    { id: "2", label: "اقلام کم موجود", value: "۹", hint: "مخصوصا کولر گازی و ساید بای ساید" },
    { id: "3", label: "سفارش در انتظار تایید", value: "۶", hint: "ارسال شده برای مدیر فروش" },
  ],
  manager: [
    { id: "1", label: "در انتظار تأیید", value: "۷", hint: "اولویت بالا برای تعیین تکلیف" },
    { id: "2", label: "تأییدشده امروز", value: "۱۲", hint: "منتقل شده به صف انبار" },
    { id: "3", label: "لغوشده امروز", value: "۲", hint: "به دلیل مغایرت ظرفیت تامین" },
  ],
  warehouse: [
    { id: "1", label: "در بررسی انبار", value: "۵", hint: "سفارش های تاییدشده برای خروج" },
    { id: "2", label: "حواله خروج صادرشده", value: "۸", hint: "در حال ارسال به نمایندگی ها" },
    { id: "3", label: "تحویل تاییدشده", value: "۴", hint: "ثبت نهایی در سیستم" },
  ],
  finance: [
    { id: "1", label: "آماده صدور فاکتور", value: "۶", hint: "تحویل تایید شده، منتظر نهایی سازی مالی" },
    { id: "2", label: "فاکتور صادرشده", value: "۲۳", hint: "در چرخه جاری ماه" },
    { id: "3", label: "مانده تسویه", value: "۸.۲ میلیارد", hint: "ریال" },
  ],
  support: [
    { id: "1", label: "کالاهای فعال", value: "۴۳۸", hint: "در دسته های اصلی لوازم خانگی" },
    { id: "2", label: "کم موجودی", value: "۱۱", hint: "نیازمند اصلاح سریع موجودی" },
    { id: "3", label: "ویرایش ویژه سفارش", value: "۳", hint: "ثبت شده توسط تیم پشتیبانی" },
  ],
};

export const activityByRole: Record<RoleKey, ActivityItem[]> = {
  expert: [
    { id: "1", text: "سفارش ترکیبی یخچال فریزر دیپوینت و لباسشویی مکسن ثبت شد.", time: "۸ دقیقه پیش" },
    { id: "2", text: "درخواست رزرو موجودی برای ساید بای ساید جنرال هاوس ثبت شد.", time: "۲۹ دقیقه پیش" },
    { id: "3", text: "اصلاح تعداد سفارش جاروبرقی نانیوا انجام شد.", time: "۱ ساعت پیش" },
  ],
  manager: [
    { id: "1", text: "سفارش EX-9005 تایید و به بررسی انبار ارجاع شد.", time: "۱۰ دقیقه پیش" },
    { id: "2", text: "سفارش EX-9003 به دلیل مغایرت ظرفیت لغو شد.", time: "۳۴ دقیقه پیش" },
    { id: "3", text: "گزارش روند سفارش های هفتگی مرور شد.", time: "۱ ساعت پیش" },
  ],
  warehouse: [
    { id: "1", text: "حواله خروج SLP-7001 برای سفارش EX-9002 صادر شد.", time: "۹ دقیقه پیش" },
    { id: "2", text: "تحویل سفارش EX-9002 به نمایندگی تایید شد.", time: "۲۶ دقیقه پیش" },
    { id: "3", text: "بارگیری اقلام کولر گازی جنرال هاوس تکمیل شد.", time: "۵۸ دقیقه پیش" },
  ],
  finance: [
    { id: "1", text: "فاکتور INV-1042 برای سفارش EX-9004 صادر شد.", time: "۱۵ دقیقه پیش" },
    { id: "2", text: "تطبیق حواله خروج SLP-7001 با سفارش تایید شد.", time: "۳۷ دقیقه پیش" },
    { id: "3", text: "گزارش فاکتورهای روزانه نهایی گردید.", time: "۱ ساعت پیش" },
  ],
  support: [
    { id: "1", text: "کالای کولر گازی جنرال هاوس 24000 به لیست فعال اضافه شد.", time: "۷ دقیقه پیش" },
    { id: "2", text: "مغایرت موجودی ماشین ظرفشویی دیپوینت اصلاح شد.", time: "۳۱ دقیقه پیش" },
    { id: "3", text: "ویرایش ویژه سفارش EX-9005 توسط پشتیبانی ثبت شد.", time: "۱ ساعت پیش" },
  ],
};
