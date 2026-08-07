import { httpClient } from "@/lib/api/http-client";
import { ApiError } from "@/lib/api/api-error";
import { getShipmentStopReasonLabel } from "@/lib/domain/order-action-reasons";
import { mapOrderDto, mapOrderListDto } from "@/lib/mappers/order.mapper";
import { normalizeOrderEditPayload } from "@/lib/mappers/order-edit.mapper";
import {
  mapProductOrderOptionListDto,
  mapProductOrderOptionDto,
} from "@/lib/mappers/product.mapper";
import { mapCustomerListDto } from "@/lib/mappers/customer.mapper";
import { toArray, toRecord } from "@/lib/mappers/mapper-utils";
import type {
  CancelOrderPayload,
  CreateOrderPayload,
  LockShipmentPayload,
  MarkOrderNeedsReviewPayload,
  Order,
  OrderApprovalResult,
  OrderEditData,
  OrderFilters,
  QuotationStatus,
  ReleaseShipmentPayload,
  ResolveOrderReviewPayload,
  StopShipmentPayload,
  UpdatePendingOrderPayload,
  UnlockShipmentPayload,
} from "@/lib/models/order.model";

export async function listOrders(filters?: OrderFilters): Promise<Order[]> {
  const data = await httpClient.get<unknown>(buildOrdersPath(filters));
  return mapOrderListDto(data);
}

export async function getOrder(objectId: string): Promise<Order> {
  const data = await httpClient.get<unknown>(`/api/orders/${objectId}`);
  return mapOrderDto(data);
}

export async function getOrderEditData(objectId: string): Promise<OrderEditData> {
  const data = await httpClient.get<unknown>(`/api/orders/${objectId}/edit-data`);
  const record = toRecord(data);
  const orderSource = record.order ?? record.data ?? data;
  const productSource =
    record.products ??
    record.orderProducts ??
    record.productOptions ??
    record.availableProducts ??
    [];
  const customerSource =
    record.customers ??
    record.assignedCustomers ??
    record.customerOptions ??
    [];
  const order = mergeOrderEditSnapshot(
    mapOrderDto(orderSource),
    record,
  );

  return {
    order,
    canEdit:
      record.canEdit === undefined || record.canEdit === null
        ? true
        : Boolean(record.canEdit),
    editBlockedReason:
      typeof record.editBlockedReason === "string"
        ? record.editBlockedReason
        : typeof record.reason === "string"
          ? record.reason
          : null,
    products: mergeOrderProducts(
      mapProductOrderOptionListDto(toArray(productSource)),
      mapOrderDto(orderSource),
    ),
    customers: mapCustomerListDto(toArray(customerSource)),
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const data = await httpClient.post<unknown>(
    "/api/orders",
    normalizeOrderPayload(payload),
  );
  return mapOrderDto(data);
}

export async function updatePendingOrder(
  objectId: string,
  payload: UpdatePendingOrderPayload,
): Promise<Order> {
  const data = await httpClient.patch<unknown>(
    `/api/orders/${objectId}`,
    normalizeOrderPayload(payload),
  );
  return mapOrderDto(data);
}

export async function lockShipment(
  objectId: string,
  payload: LockShipmentPayload,
): Promise<Order> {
  return stopShipment(objectId, payload);
}

export async function unlockShipment(
  objectId: string,
  payload: UnlockShipmentPayload,
): Promise<Order> {
  return releaseShipment(objectId, payload);
}

export async function stopShipment(
  objectId: string,
  payload: StopShipmentPayload,
): Promise<Order> {
  try {
    const data = await httpClient.post<unknown>(
      `/api/orders/${objectId}/stop-shipment`,
      payload,
    );
    return mapOrderDto(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const reasonLabel = getShipmentStopReasonLabel(payload.reasonCode);
      const data = await httpClient.post<unknown>(
        `/api/orders/${objectId}/hold`,
        {
          reasonCode: payload.reasonCode,
          reason: reasonLabel,
          stoppedByName: payload.stoppedByName,
          heldByName: payload.heldByName ?? payload.stoppedByName,
        },
      );
      return mapOrderDto(data);
    }
    throw error;
  }
}

export async function releaseShipment(
  objectId: string,
  payload: ReleaseShipmentPayload,
): Promise<Order> {
  try {
    const data = await httpClient.post<unknown>(
      `/api/orders/${objectId}/release-shipment`,
      payload,
    );
    return mapOrderDto(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const data = await httpClient.post<unknown>(
        `/api/orders/${objectId}/unhold`,
        payload,
      );
      return mapOrderDto(data);
    }
    throw error;
  }
}

function normalizeOrderPayload(
  payload: UpdatePendingOrderPayload,
): Record<string, unknown> {
  return normalizeOrderEditPayload(payload);
}

function mergeOrderProducts(products: ReturnType<typeof mapProductOrderOptionListDto>, order: Order) {
  const productMap = new Map(products.map((product) => [product.objectId, product]));
  order.items.forEach((item) => {
    if (!item.productId || productMap.has(item.productId)) return;
    productMap.set(
      item.productId,
      mapProductOrderOptionDto({
        objectId: item.productId,
        id: item.productSku,
        sku: item.productSku,
        sepidarCode: item.productSku,
        name: item.productName,
        brand: item.brand,
        brandName: item.brandName,
        unit: "عدد",
        unitPrice: item.unitPrice,
      }),
    );
  });
  return Array.from(productMap.values());
}

function mergeOrderEditSnapshot(order: Order, record: Record<string, unknown>): Order {
  const priceList = toRecord(record.priceList);
  const saleType = toRecord(record.saleType);
  const salesType = toRecord(record.salesType);
  const fallbackPriceListId =
    record.priceListId === undefined || record.priceListId === null
      ? order.priceListId
      : String(record.priceListId);
  const fallbackPriceListTitle =
    record.priceListTitle === undefined || record.priceListTitle === null
      ? order.priceListTitle
      : String(record.priceListTitle);
  const fallbackPriceListType =
    record.priceListType === undefined || record.priceListType === null
      ? order.priceListType
      : String(record.priceListType);
  const fallbackPriceListBrand =
    record.priceListBrand === undefined || record.priceListBrand === null
      ? order.priceListBrand
      : String(record.priceListBrand);
  const salesTypeObjectId =
    order.salesTypeObjectId ||
    order.saleTypeObjectId ||
    toStringSnapshot(salesType.objectId) ||
    toStringSnapshot(saleType.objectId) ||
    null;
  const salesTypeTitle =
    order.salesTypeTitle ||
    order.saleTypeTitle ||
    toStringSnapshot(salesType.title) ||
    toStringSnapshot(saleType.title) ||
    null;
  const salesTypeInternalCode =
    order.salesTypeInternalCode ??
    toNumberSnapshot(salesType.internalCode) ??
    toNumberSnapshot(saleType.internalCode) ??
    null;
  const salesTypeSepidarCode =
    order.salesTypeSepidarCode ??
    order.sepidarSaleTypeId ??
    toNumberSnapshot(salesType.sepidarCode) ??
    toNumberSnapshot(saleType.sepidarSaleTypeId) ??
    null;

  return {
    ...order,
    priceListId: fallbackPriceListId ?? order.priceListId,
    priceListTitle: fallbackPriceListTitle ?? order.priceListTitle,
    priceListType: fallbackPriceListType ?? order.priceListType,
    priceListBrand: fallbackPriceListBrand ?? order.priceListBrand,
    priceList:
      priceList.objectId || fallbackPriceListId || order.priceList
        ? {
            ...(order.priceList ?? {}),
            objectId: toStringSnapshot(priceList.objectId) || fallbackPriceListId || order.priceList?.objectId || null,
            id: toStringSnapshot(priceList.id) || fallbackPriceListId || order.priceList?.id || null,
            title: toStringSnapshot(priceList.title) || fallbackPriceListTitle || order.priceList?.title || null,
            name: toStringSnapshot(priceList.name) || fallbackPriceListTitle || order.priceList?.name || null,
            typeCode: toStringSnapshot(priceList.typeCode) || fallbackPriceListType || order.priceList?.typeCode || null,
            brandName: toStringSnapshot(priceList.brandName) || fallbackPriceListBrand || order.priceList?.brandName || null,
          }
        : order.priceList,
    salesTypeObjectId,
    saleTypeObjectId: salesTypeObjectId,
    salesTypeTitle,
    saleTypeTitle: salesTypeTitle,
    salesTypeInternalCode,
    salesTypeSepidarCode,
    sepidarSaleTypeId: salesTypeSepidarCode,
    salesType: salesTypeObjectId || salesTypeTitle || salesTypeInternalCode !== null || salesTypeSepidarCode !== null
      ? {
          objectId: salesTypeObjectId,
          title: salesTypeTitle,
          internalCode: salesTypeInternalCode,
          sepidarCode: salesTypeSepidarCode,
        }
      : order.salesType,
    saleType: salesTypeObjectId || salesTypeTitle || salesTypeInternalCode !== null || salesTypeSepidarCode !== null
      ? {
          objectId: salesTypeObjectId,
          sepidarSaleTypeId: salesTypeSepidarCode,
          title: salesTypeTitle,
        }
      : order.saleType,
  };
}

function toStringSnapshot(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function toNumberSnapshot(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export interface ApproveOrderPayload {
  stockObjectId?: string;
}

export async function approveOrder(
  objectId: string,
  payload?: ApproveOrderPayload,
): Promise<OrderApprovalResult> {
  const data = await httpClient.post<unknown>(
    `/api/orders/${objectId}/approve`,
    payload,
  );
  return mapApprovalResult(objectId, data);
}

export async function retryOrderQuotation(
  objectId: string,
): Promise<OrderApprovalResult> {
  const data = await httpClient.post<unknown>(
    `/api/orders/${objectId}/retry-quotation`,
  );
  const order = mapOrderDto(data);
  return {
    order,
    quotationStatus: order.quotationStatus,
    warning: null,
  };
}

export async function cancelOrder(
  objectId: string,
  payload: CancelOrderPayload,
): Promise<Order> {
  const data = await httpClient.post<unknown>(
    `/api/orders/${objectId}/cancel`,
    payload,
  );
  return mapOrderDto(data);
}

export async function markOrderNeedsReview(
  objectId: string,
  payload: MarkOrderNeedsReviewPayload,
): Promise<Order> {
  const data = await httpClient.post<unknown>(
    `/api/orders/${objectId}/needs-review`,
    payload,
  );
  return mapOrderDto(data);
}

export async function resolveOrderReview(
  objectId: string,
  payload: ResolveOrderReviewPayload,
): Promise<Order> {
  const data = await httpClient.post<unknown>(
    `/api/orders/${objectId}/resolve-review`,
    payload,
  );
  return mapOrderDto(data);
}

export async function voidExpiredReviews(): Promise<Order[]> {
  const data = await httpClient.post<unknown>(
    "/api/orders/void-expired-reviews",
  );
  return mapOrderListDto(data);
}

function buildOrdersPath(filters?: OrderFilters): string {
  if (!filters) return "/api/orders";

  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.orderType) params.set("orderType", filters.orderType);

  const query = params.toString();
  return query ? `/api/orders?${query}` : "/api/orders";
}

function mapApprovalResult(
  _objectId: string,
  data: unknown,
): OrderApprovalResult {
  const record =
    data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};
  const nestedOrder =
    record.order && typeof record.order === "object"
      ? (record.order as Record<string, unknown>)
      : null;
  const quotationStatus = normalizeQuotationStatus(
    record.quotationStatus ?? nestedOrder?.quotationStatus,
  );
  const orderSource = nestedOrder ?? record;
  const hasOrderData = Boolean(
    orderSource.objectId || orderSource.id || orderSource.orderCode,
  );
  const order = hasOrderData
    ? mapOrderDto({
        ...orderSource,
        orderStatus: "approved",
        quotationStatus,
      })
    : null;

  return {
    order,
    quotationStatus,
    warning:
      typeof record.warning === "string" && record.warning.trim()
        ? record.warning
        : null,
  };
}

function normalizeQuotationStatus(value: unknown): QuotationStatus {
  if (value === "created") return "success";
  return value === "success" || value === "failed" ? value : "pending";
}
