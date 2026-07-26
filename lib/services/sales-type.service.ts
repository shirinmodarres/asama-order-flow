import { httpClient } from "@/lib/api/http-client";
import { toArray, toNullableString, toNumberValue, toRecord, toStringValue } from "@/lib/mappers/mapper-utils";
import type { SalesType } from "@/lib/models/sales-type.model";

export async function listActiveSalesTypes(): Promise<SalesType[]> {
  const data = await httpClient.get<unknown>("/api/sales-types");
  return toArray(data).map(mapSalesTypeDto);
}

function mapSalesTypeDto(dto: unknown): SalesType {
  const record = toRecord(dto);
  return {
    objectId: toStringValue(record.objectId || record.id),
    id: toStringValue(record.id || record.objectId),
    title: toStringValue(record.title),
    internalCode:
      record.internalCode === undefined || record.internalCode === null
        ? null
        : toNumberValue(record.internalCode),
    sepidarCode:
      record.sepidarCode === undefined || record.sepidarCode === null
        ? null
        : toNumberValue(record.sepidarCode),
    isActive: record.isActive !== false,
    sortOrder: toNumberValue(record.sortOrder),
    createdAt: toNullableString(record.createdAt),
    updatedAt: toNullableString(record.updatedAt),
  };
}
