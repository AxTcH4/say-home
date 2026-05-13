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
  | "SALE_DEED"
  | "LAND_TITLE"
  | "MORTGAGE_CONTRACT"
  | "PAYMENT_RECEIPT"
  | "LEASE_CONTRACT"
  | "RENT_RECEIPT"
  | "PROPERTY_INSPECTION_REPORT"
  | "SECURITY_DEPOSIT_RECEIPT"
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

export interface RealEstateExpectedDocument {
  type: RealEstateDocumentType;
  title: string;
  description: string;
  sampleContent: string;
  uploaded: boolean;
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
  expectedDocuments: RealEstateExpectedDocument[];
}

export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
  error?: string | null;
}
