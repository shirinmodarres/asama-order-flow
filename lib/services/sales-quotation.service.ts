import { httpClient } from "@/lib/api/http-client";
import { getStoredSessionToken } from "@/lib/services/auth.service";
import { toRecord } from "@/lib/mappers/mapper-utils";
import {
  mapSalesQuotationDto,
  mapSalesQuotationListDto,
  mapSalesQuotationProductOptionListDto,
} from "@/lib/mappers/sales-quotation.mapper";
import type {
  CreateSalesQuotationPayload,
  SalesQuotation,
  SalesQuotationFilters,
  SalesQuotationProductOption,
  UpdateSalesQuotationPayload,
} from "@/lib/models/sales-quotation.model";

export async function listSalesQuotations(
  filters?: SalesQuotationFilters,
): Promise<SalesQuotation[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.customerObjectId) params.set("customerObjectId", filters.customerObjectId);
  if (filters?.priceListObjectId) params.set("priceListObjectId", filters.priceListObjectId);
  if (filters?.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
  const query = params.toString();
  const data = await httpClient.get<unknown>(`/api/sales-quotations${query ? `?${query}` : ""}`);
  return mapSalesQuotationListDto(data);
}

export async function getSalesQuotation(objectId: string): Promise<SalesQuotation> {
  const data = await httpClient.get<unknown>(`/api/sales-quotations/${objectId}`);
  return mapSalesQuotationDto(data);
}

export async function getSalesQuotationPdfData(
  objectId: string,
): Promise<SalesQuotation> {
  const data = await httpClient.get<unknown>(
    `/api/sales-quotations/${objectId}/pdf-data`,
  );
  return mapSalesQuotationDto(data);
}

export async function downloadSalesQuotationPdf(
  objectId: string,
): Promise<Blob> {
  const configuredApiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiBaseUrl = configuredApiBaseUrl
    ? configuredApiBaseUrl.replace(/\/$/, "")
    : "http://localhost:4000";
  const sessionToken = getStoredSessionToken();

  const response = await fetch(
    `${apiBaseUrl}/api/sales-quotations/${objectId}/pdf`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
        ...(sessionToken ? { "session-token": sessionToken } : {}),
      },
    },
  );

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => null);
      const message =
        typeof payload?.error?.message === "string"
          ? payload.error.message
          : "دانلود PDF انجام نشد.";
      throw new Error(message);
    }

    const text = await response.text().catch(() => "");
    throw new Error(text || "دانلود PDF انجام نشد.");
  }

  return response.blob();
}

export async function listSalesQuotationProductOptions(
  customerObjectId: string,
  priceListId: string,
  expertUserId?: string,
): Promise<SalesQuotationProductOption[]> {
  const params = new URLSearchParams({
    customerObjectId,
    priceListId,
  });
  if (expertUserId) params.set("expertUserId", expertUserId);
  const data = await httpClient.get<unknown>(
    `/api/sales-quotations/product-options?${params.toString()}`,
  );
  return mapSalesQuotationProductOptionListDto(data);
}

export async function createSalesQuotation(
  payload: CreateSalesQuotationPayload,
): Promise<SalesQuotation> {
  const data = await httpClient.post<unknown>("/api/sales-quotations", payload);
  return mapSalesQuotationDto(data);
}

export async function updateSalesQuotation(
  objectId: string,
  payload: UpdateSalesQuotationPayload,
): Promise<SalesQuotation> {
  const data = await httpClient.patch<unknown>(
    `/api/sales-quotations/${objectId}`,
    payload,
  );
  return mapSalesQuotationDto(data);
}

export async function finalizeSalesQuotation(
  objectId: string,
): Promise<SalesQuotation> {
  const data = await httpClient.post<unknown>(
    `/api/sales-quotations/${objectId}/finalize`,
  );
  return mapSalesQuotationDto(data);
}

export async function cancelSalesQuotation(
  objectId: string,
): Promise<SalesQuotation> {
  const data = await httpClient.post<unknown>(
    `/api/sales-quotations/${objectId}/cancel`,
  );
  return mapSalesQuotationDto(data);
}

export async function duplicateSalesQuotation(
  objectId: string,
): Promise<SalesQuotation> {
  const data = await httpClient.post<unknown>(
    `/api/sales-quotations/${objectId}/duplicate`,
  );
  return mapSalesQuotationDto(data);
}
