export interface DashboardProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

export interface DashboardProfileUpdatePayload {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface DashboardSummary {
  boughtProperties: number;
  rentedProperties: number;
  negotiatingProperties: number;
  ticketsCount: number;
}

export type RealEstateRelationStatus =
  | "FAVORITE"
  | "NEGOTIATING"
  | "BOUGHT"
  | "RENTED";

export type RealEstateDocumentType =
  | "RECEIPT"
  | "CONTRACT"
  | "PAYMENT_PROOF"
  | "ID_COPY"
  | "OTHER";

export interface RealEstateDocument {
  id: number;
  name: string;
  url: string;
  type: RealEstateDocumentType;
  uploadedAt: string;
}

export interface RealEstateRecord {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyType: string;
  propertySector: string;
  propertyPrice: number;
  propertyStatus: string;
  relationStatus: RealEstateRelationStatus;
  finalPrice?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  medias: string[];
  documents: RealEstateDocument[];
}

export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
  error?: string | null;
}
