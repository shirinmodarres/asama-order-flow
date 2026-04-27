import { apiRequest } from "@/lib/api-client";

export interface Product {
  objectId: string;
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  unitPrice: number;
  description: string | null;
  status: "active" | "inactive";
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  najaInventoryQty: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  unitPrice: number;
  description?: string;
  status: "active" | "inactive";
  totalStock: number;
}

type ApiEnvelope<T> = {
  ok?: boolean;
  data?: T;
  product?: T;
  result?: T;
};

export async function listProducts(): Promise<Product[]> {
  const response = await apiRequest<
    ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]
  >("/api/products");

  if (Array.isArray(response)) return response.map(normalizeProduct);
  if (response && "data" in response && Array.isArray(response.data)) {
    return response.data.map(normalizeProduct);
  }

  throw new Error("پاسخ فهرست کالاها معتبر نیست.");
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await apiRequest<
    ApiEnvelope<Record<string, unknown>> | Record<string, unknown>
  >("/api/products", {
    method: "POST",
    body: payload,
  });

  const product = unwrapProduct(response);
  if (product) return normalizeProduct(product);

  throw new Error("پاسخ ثبت کالا معتبر نیست.");
}

function unwrapProduct(
  response: ApiEnvelope<Record<string, unknown>> | Record<string, unknown>,
): Record<string, unknown> | null {
  if (!response || typeof response !== "object") return null;

  if (
    "data" in response &&
    response.data &&
    typeof response.data === "object"
  ) {
    return response.data as Record<string, unknown>;
  }
  if (
    "product" in response &&
    response.product &&
    typeof response.product === "object"
  ) {
    return response.product as Record<string, unknown>;
  }
  if (
    "result" in response &&
    response.result &&
    typeof response.result === "object"
  ) {
    return response.result as Record<string, unknown>;
  }
  if ("objectId" in response || "id" in response || "name" in response) {
    return response;
  }

  return null;
}

function normalizeProduct(raw: Record<string, unknown>): Product {
  const objectId = toStringValue(raw.objectId) || toStringValue(raw.id);
  const id = toStringValue(raw.id) || objectId;
  const totalStock = toNumberValue(
    raw.totalStock ?? raw.initialStock ?? raw.stock,
  );
  const reservedStock = toNumberValue(raw.reservedStock ?? raw.reservedQty);
  const availableStock = toNumberValue(
    raw.availableStock ?? raw.availableQty ?? totalStock - reservedStock,
  );

  return {
    objectId,
    id,
    name: toStringValue(raw.name),
    brand: toStringValue(raw.brand),
    category: toStringValue(raw.category),
    unit: toStringValue(raw.unit) || "عدد",
    unitPrice: toNumberValue(raw.unitPrice ?? raw.price),
    description:
      typeof raw.description === "string" && raw.description.trim().length > 0
        ? raw.description
        : null,
    status: raw.status === "inactive" ? "inactive" : "active",
    totalStock,
    reservedStock,
    availableStock,
    najaInventoryQty: toNumberValue(raw.najaInventoryQty ?? raw.najaStock),
    createdAt: toStringValue(raw.createdAt),
    updatedAt: toStringValue(raw.updatedAt),
  };
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function toNumberValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
