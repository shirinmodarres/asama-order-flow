import type {
  ExitSlip,
  ExpertOrder,
  Invoice,
  InventoryHistoryEntry,
  OrderStatus,
  Product,
  WarehouseHistoryEntry,
  WarehouseStatus,
} from "@/lib/expert/types";

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "در انتظار تأیید",
  approved: "تأیید شده",
  cancelled: "لغو شده",
  invoiced: "فاکتور شده",
};

export const warehouseStatusLabel: Record<WarehouseStatus, string> = {
  reserved: "رزرو موجودی",
  reviewing: "در بررسی انبار",
  returned: "بازگشت به موجودی",
  processing: "در حال آماده سازی انبار",
  dispatchIssued: "حواله خروج صادر شد",
  delivered: "تأیید تحویل به مشتری",
  completed: "نهایی شده",
};

export const invoiceStatusLabel = {
  issued: "صادر شده",
} as const;

export const initialProducts: Product[] = [
  {
    id: "p-100",
    name: "یخچال فریزر دیپوینت مدل D4i",
    brand: "دیپوینت",
    category: "یخچال و فریزر",
    unit: "دستگاه",
    unitPrice: 685000000,
    description: "یخچال فریزر کم مصرف مناسب فروشگاه های زنجیره ای",
    status: "active",
    totalStock: 74,
    reservedStock: 11,
  },
  {
    id: "p-101",
    name: "ماشین لباسشویی مکسن 8 کیلویی مدل MX-W8",
    brand: "مکسن",
    category: "لباسشویی",
    unit: "دستگاه",
    unitPrice: 412000000,
    description: "لباسشویی اتوماتیک 8 کیلویی",
    status: "active",
    totalStock: 58,
    reservedStock: 9,
  },
  {
    id: "p-102",
    name: "ماشین ظرفشویی دیپوینت مدل DWP-14",
    brand: "دیپوینت",
    category: "ظرفشویی",
    unit: "دستگاه",
    unitPrice: 438000000,
    description: "ظرفشویی 14 نفره با برنامه اقتصادی",
    status: "active",
    totalStock: 39,
    reservedStock: 6,
  },
  {
    id: "p-103",
    name: "جاروبرقی نانیوا مدل Turbo 2000",
    brand: "نانیوا",
    category: "جاروبرقی",
    unit: "دستگاه",
    unitPrice: 96000000,
    description: "جاروبرقی مخزن دار با توان 2000 وات",
    status: "active",
    totalStock: 132,
    reservedStock: 21,
  },
  {
    id: "p-104",
    name: "کولر گازی جنرال هاوس 24000 مدل GH-24",
    brand: "جنرال هاوس",
    category: "کولر گازی",
    unit: "دستگاه",
    unitPrice: 527000000,
    description: "اسپلیت 24000 سرمایش و گرمایش",
    status: "active",
    totalStock: 44,
    reservedStock: 12,
  },
  {
    id: "p-105",
    name: "اجاق گاز مکسن 5 شعله مدل MX-5B",
    brand: "مکسن",
    category: "اجاق گاز",
    unit: "دستگاه",
    unitPrice: 215000000,
    description: "اجاق مبله 5 شعله",
    status: "active",
    totalStock: 63,
    reservedStock: 8,
  },
  {
    id: "p-106",
    name: "مایکروویو نانیوا مدل NMW-34",
    brand: "نانیوا",
    category: "مایکروویو",
    unit: "دستگاه",
    unitPrice: 118000000,
    description: "مایکروویو 34 لیتری",
    status: "active",
    totalStock: 51,
    reservedStock: 4,
  },
  {
    id: "p-107",
    name: "تلویزیون دیپوینت 55 اینچ مدل TV55-UHD",
    brand: "دیپوینت",
    category: "تلویزیون",
    unit: "دستگاه",
    unitPrice: 364000000,
    description: "تلویزیون هوشمند 4K",
    status: "active",
    totalStock: 47,
    reservedStock: 7,
  },
  {
    id: "p-108",
    name: "آبسردکن مکسن مدل WD-220",
    brand: "مکسن",
    category: "آبسردکن",
    unit: "دستگاه",
    unitPrice: 79000000,
    description: "آبسردکن ایستاده اداری",
    status: "active",
    totalStock: 36,
    reservedStock: 5,
  },
  {
    id: "p-109",
    name: "ساید بای ساید جنرال هاوس مدل SBS-32",
    brand: "جنرال هاوس",
    category: "ساید بای ساید",
    unit: "دستگاه",
    unitPrice: 792000000,
    description: "ساید بای ساید 32 فوت",
    status: "active",
    totalStock: 26,
    reservedStock: 6,
  },
];

export const initialOrders: ExpertOrder[] = [
  {
    id: "o-9001",
    code: "EX-9001",
    createdBy: "علی رضایی",
    customerName: "فروشگاه خانه مدرن تهران",
    createdAt: "2026-04-15T08:45:00.000Z",
    updatedAt: "2026-04-15T08:45:00.000Z",
    status: "pending",
    warehouseStatus: "reserved",
    items: [
      { productId: "p-100", quantity: 3 },
      { productId: "p-101", quantity: 4 },
    ],
  },
  {
    id: "o-9002",
    code: "EX-9002",
    createdBy: "علی رضایی",
    customerName: "نمایندگی مرکزی آریا",
    createdAt: "2026-04-14T10:30:00.000Z",
    updatedAt: "2026-04-15T12:05:00.000Z",
    status: "approved",
    warehouseStatus: "dispatchIssued",
    items: [
      { productId: "p-104", quantity: 2 },
      { productId: "p-103", quantity: 5 },
      { productId: "p-106", quantity: 2 },
    ],
  },
  {
    id: "o-9003",
    code: "EX-9003",
    createdBy: "علی رضایی",
    customerName: "فروشگاه سپهر لوازم",
    createdAt: "2026-04-12T12:00:00.000Z",
    updatedAt: "2026-04-12T13:20:00.000Z",
    status: "cancelled",
    warehouseStatus: "returned",
    items: [{ productId: "p-109", quantity: 2 }],
  },
  {
    id: "o-9004",
    code: "EX-9004",
    createdBy: "علی رضایی",
    customerName: "شعبه غرب بازار خانه",
    createdAt: "2026-04-10T09:15:00.000Z",
    updatedAt: "2026-04-17T09:10:00.000Z",
    status: "invoiced",
    warehouseStatus: "completed",
    items: [
      { productId: "p-102", quantity: 3 },
      { productId: "p-107", quantity: 2 },
    ],
  },
  {
    id: "o-9005",
    code: "EX-9005",
    createdBy: "علی رضایی",
    customerName: "فروشگاه امین کالا",
    createdAt: "2026-04-16T09:20:00.000Z",
    updatedAt: "2026-04-16T10:15:00.000Z",
    status: "approved",
    warehouseStatus: "reviewing",
    items: [
      { productId: "p-105", quantity: 3 },
      { productId: "p-108", quantity: 4 },
    ],
  },
  {
    id: "o-9006",
    code: "EX-9006",
    createdBy: "علی رضایی",
    customerName: "نمایندگی جنوب آساما",
    createdAt: "2026-04-13T11:05:00.000Z",
    updatedAt: "2026-04-16T16:25:00.000Z",
    status: "approved",
    warehouseStatus: "delivered",
    items: [
      { productId: "p-100", quantity: 2 },
      { productId: "p-109", quantity: 1 },
    ],
  },
];

export const initialExitSlips: ExitSlip[] = [
  {
    id: "es-7001",
    slipNumber: "SLP-7001",
    orderId: "o-9002",
    createdBy: "رضا احمدی",
    exitDate: "2026-04-15",
    notes: "خروج کالا برای نمایندگی مرکزی تهران.",
    createdAt: "2026-04-15T12:05:00.000Z",
  },
  {
    id: "es-7002",
    slipNumber: "SLP-7002",
    orderId: "o-9006",
    createdBy: "رضا احمدی",
    exitDate: "2026-04-16",
    notes: "تحویل سفارش ترکیبی ساید بای ساید و یخچال.",
    createdAt: "2026-04-16T14:10:00.000Z",
    deliveredAt: "2026-04-16T16:25:00.000Z",
  },
  {
    id: "es-7003",
    slipNumber: "SLP-7003",
    orderId: "o-9004",
    createdBy: "رضا احمدی",
    exitDate: "2026-04-11",
    notes: "خروج ترکیبی ماشین ظرفشویی و تلویزیون برای شعبه غرب.",
    createdAt: "2026-04-11T10:40:00.000Z",
    deliveredAt: "2026-04-11T18:30:00.000Z",
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: "inv-1001",
    invoiceNumber: "INV-1001",
    orderId: "o-9004",
    exitSlipId: "es-7003",
    createdBy: "مریم نادری",
    issuedAt: "2026-04-17T09:10:00.000Z",
    status: "issued",
    items: [
      { productId: "p-102", quantity: 3 },
      { productId: "p-107", quantity: 2 },
    ],
  },
];

export const initialWarehouseHistory: WarehouseHistoryEntry[] = [
  {
    id: "wh-1001",
    orderId: "o-9005",
    status: "reviewing",
    changedAt: "2026-04-16T10:15:00.000Z",
    changedBy: "محمد کاظمی",
    note: "سفارش تایید و به بررسی انبار ارجاع شد.",
  },
  {
    id: "wh-1002",
    orderId: "o-9002",
    status: "dispatchIssued",
    changedAt: "2026-04-15T12:05:00.000Z",
    changedBy: "رضا احمدی",
    note: "حواله خروج صادر شد.",
  },
  {
    id: "wh-1003",
    orderId: "o-9006",
    status: "delivered",
    changedAt: "2026-04-16T16:25:00.000Z",
    changedBy: "رضا احمدی",
    note: "تحویل سفارش در مقصد تایید شد.",
  },
];

export const initialInventoryHistory: InventoryHistoryEntry[] = [
  {
    id: "ih-1001",
    productId: "p-100",
    changeType: "increase",
    amount: 12,
    note: "ورود سری جدید یخچال فریزر دیپوینت",
    createdAt: "2026-04-15T07:20:00.000Z",
    createdBy: "سارا کریمی",
  },
  {
    id: "ih-1002",
    productId: "p-104",
    changeType: "decrease",
    amount: 4,
    note: "اصلاح مغایرت شمارش کولر گازی",
    createdAt: "2026-04-16T09:05:00.000Z",
    createdBy: "سارا کریمی",
  },
];

export function getOrderEditBlockReason(status: OrderStatus): string {
  if (status === "approved") return "این سفارش تایید شده و قابل ویرایش نیست.";
  if (status === "cancelled") return "این سفارش لغو شده و قابل ویرایش نیست.";
  if (status === "invoiced") return "این سفارش فاکتور شده و قابل ویرایش نیست.";
  return "";
}

export function getOrderLastStageLabel(order: ExpertOrder): string {
  if (order.status === "pending") return "در انتظار تصمیم مدیر فروش";
  if (order.status === "cancelled") return "بازگشت رزرو به موجودی";
  if (order.status === "invoiced") return "فاکتور صادر شده";
  return warehouseStatusLabel[order.warehouseStatus];
}
