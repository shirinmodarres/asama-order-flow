export type OrderStatus = "pending" | "approved" | "cancelled" | "invoiced";

export type WarehouseStatus =
  | "reserved"
  | "reviewing"
  | "returned"
  | "processing"
  | "dispatchIssued"
  | "delivered"
  | "completed";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  unitPrice: number;
  description?: string;
  status: "active" | "inactive";
  totalStock: number;
  reservedStock: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface ExpertOrder {
  id: string;
  code: string;
  createdBy: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  warehouseStatus: WarehouseStatus;
  items: OrderItem[];
}

export interface CreateOrderInput {
  customerName: string;
  items: OrderItem[];
}

export interface UpdateOrderInput {
  id: string;
  customerName: string;
  items: OrderItem[];
}

export interface ExitSlip {
  id: string;
  slipNumber: string;
  orderId: string;
  createdBy: string;
  exitDate: string;
  notes: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface CreateExitSlipInput {
  orderId: string;
  slipNumber: string;
  exitDate: string;
  createdBy: string;
  notes: string;
}

export interface WarehouseHistoryEntry {
  id: string;
  orderId: string;
  status: WarehouseStatus;
  changedAt: string;
  changedBy: string;
  note: string;
}

export type InvoiceStatus = "issued";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  exitSlipId: string;
  createdBy: string;
  issuedAt: string;
  status: InvoiceStatus;
  items: OrderItem[];
}

export interface CreateInvoiceInput {
  orderId: string;
  createdBy: string;
}

export interface CreateProductInput {
  name: string;
  brand: string;
  category: string;
  unit: string;
  unitPrice: number;
  initialStock: number;
  description?: string;
}

export interface UpdateProductInput {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  unitPrice: number;
  description?: string;
  status: "active" | "inactive";
}

export interface InventoryHistoryEntry {
  id: string;
  productId: string;
  changeType: "increase" | "decrease";
  amount: number;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface UpdateInventoryInput {
  productId: string;
  changeType: "increase" | "decrease";
  amount: number;
  note: string;
  createdBy: string;
}
