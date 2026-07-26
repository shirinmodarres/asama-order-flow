export interface SalesType {
  objectId: string;
  id: string;
  title: string;
  internalCode: number | null;
  sepidarCode: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export type SalesTypeList = SalesType[];
