import type { ActivityItem, DashboardStat, Role, RoleKey, SidebarItem } from "@/lib/types";

export const roles: Role[] = [
  {
    key: "expert",
    title: "کارشناس",
    description: "ثبت و پیگیری سفارش های لوازم خانگی و مدیریت رزرو موجودی برای فروش.",
    path: "/expert",
    userName: "علی رضایی",
    team: "تیم فروش و ثبت سفارش",
    icon: "briefcase",
    entrySummary: "ورود به محیط ثبت سفارش، رزرو موجودی و پیگیری سفارش های جاری.",
    accent: "brand",
  },
  {
    key: "manager",
    title: "مدیر فروش",
    description: "تصمیم گیری نهایی سفارش های در انتظار تایید و هدایت جریان عملیاتی فروش.",
    path: "/manager",
    userName: "محمد کاظمی",
    team: "مدیریت فروش",
    icon: "shield-check",
    entrySummary: "مرکز تصمیم گیری برای تایید سفارش، بررسی صف انتظار و پایش روند فروش.",
    accent: "success",
  },
  {
    key: "warehouse",
    title: "انباردار",
    description: "بررسی سفارش تاییدشده، صدور حواله خروج و ثبت تحویل نهایی به مشتری.",
    path: "/warehouse",
    userName: "رضا احمدی",
    team: "عملیات انبار و خروج کالا",
    icon: "warehouse",
    entrySummary: "مدیریت صف انبار، صدور حواله خروج و کنترل تحویل نهایی به مشتری.",
    accent: "neutral",
  },
  {
    key: "finance",
    title: "حسابداری",
    description: "کنترل سفارش های تحویل شده و نهایی سازی مالی با صدور فاکتور داخلی.",
    path: "/finance",
    userName: "مریم نادری",
    team: "مالی و صدور فاکتور",
    icon: "receipt",
    entrySummary: "تطبیق سفارش و حواله، صدور فاکتور و کنترل وضعیت مالی سفارش ها.",
    accent: "brand",
  },
  {
    key: "support",
    title: "پشتیبان",
    description: "نگهداری داده های پایه، مدیریت موجودی و ویرایش ویژه سفارش در شرایط خاص.",
    path: "/support",
    userName: "سارا کریمی",
    team: "داده پایه و پشتیبانی عملیات",
    icon: "headset",
    entrySummary: "مدیریت کالا، موجودی و اصلاح داده های پایه در سناریوهای ویژه.",
    accent: "success",
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
    {
      label: "داشبورد",
      href: "/expert",
      icon: "dashboard",
      description: "مرور وضعیت سفارش و شاخص های روز",
    },
    {
      label: "موجودی",
      href: "/expert/inventory",
      icon: "boxes",
      description: "بررسی موجودی قابل رزرو کالاها",
    },
    {
      label: "سفارش ها",
      href: "/expert/orders",
      icon: "shopping-cart",
      description: "فهرست سفارش های ثبت شده",
    },
    {
      label: "ثبت سفارش",
      href: "/expert/orders/new",
      icon: "plus-circle",
      description: "ایجاد سفارش جدید فروش",
    },
  ],
  manager: [
    {
      label: "داشبورد",
      href: "/manager",
      icon: "dashboard",
      description: "خلاصه تصمیم های امروز",
    },
    {
      label: "سفارش های در انتظار تأیید",
      href: "/manager/pending-orders",
      icon: "clipboard-check",
      description: "صف تایید و لغو سفارش",
    },
    {
      label: "روند سفارش ها",
      href: "/manager/order-tracking",
      icon: "activity",
      description: "پایش جریان سفارش تا انتها",
    },
  ],
  warehouse: [
    {
      label: "داشبورد",
      href: "/warehouse",
      icon: "dashboard",
      description: "نمای کلی عملیات انبار",
    },
    {
      label: "سفارش های تأییدشده",
      href: "/warehouse/orders",
      icon: "package",
      description: "صف سفارش های آماده بررسی",
    },
    {
      label: "حواله های خروج",
      href: "/warehouse/exit-slips",
      icon: "truck",
      description: "مدیریت حواله ها و ارسال",
    },
    {
      label: "سفارش های تحویل شده",
      href: "/warehouse/delivered",
      icon: "file-check",
      description: "ثبت و تایید تحویل نهایی",
    },
  ],
  finance: [
    {
      label: "داشبورد",
      href: "/finance",
      icon: "dashboard",
      description: "پایش وضعیت مالی سفارش ها",
    },
    {
      label: "آماده فاکتور",
      href: "/finance/ready",
      icon: "layers",
      description: "سفارش های آماده بررسی و تطبیق",
    },
    {
      label: "فاکتورها",
      href: "/finance/invoices",
      icon: "file-text",
      description: "فهرست اسناد مالی صادرشده",
    },
  ],
  support: [
    {
      label: "داشبورد",
      href: "/support",
      icon: "dashboard",
      description: "نمای کلی داده های پایه",
    },
    {
      label: "کالاها",
      href: "/support/products",
      icon: "boxes",
      description: "مدیریت فهرست و وضعیت کالاها",
    },
    {
      label: "موجودی",
      href: "/support/inventory",
      icon: "package",
      description: "افزایش و کاهش کنترل شده موجودی",
    },
    {
      label: "تاریخچه موجودی",
      href: "/support/inventory-history",
      icon: "history",
      description: "ردیابی ثبت های انبار",
    },
    {
      label: "ویرایش سفارش",
      href: "/support/orders",
      icon: "pencil",
      description: "اصلاح سفارش در سناریوهای ویژه",
    },
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
