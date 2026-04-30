import { httpClient } from "@/lib/api/http-client";
import {
  mapInvoiceDto,
  mapInvoiceListDto,
} from "@/lib/mappers/invoice.mapper";
import type {
  CreateInvoicePayload,
  Invoice,
} from "@/lib/models/invoice.model";

export async function listInvoices(): Promise<Invoice[]> {
  const data = await httpClient.get<unknown>("/api/invoices");
  return mapInvoiceListDto(data);
}

export async function getInvoice(objectId: string): Promise<Invoice> {
  const data = await httpClient.get<unknown>(`/api/invoices/${objectId}`);
  return mapInvoiceDto(data);
}

export async function createInvoice(
  orderObjectId: string,
  payload: CreateInvoicePayload,
): Promise<Invoice> {
  const data = await httpClient.post<unknown>(
    `/api/orders/${orderObjectId}/invoices`,
    payload,
  );
  return mapInvoiceDto(data);
}
