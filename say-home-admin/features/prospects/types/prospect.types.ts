export type ProspectStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "NEGOTIATING"
  | "CONVERTED"
  | "LOST";

export interface ProspectListItem {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  budgetLabel: string;
  status: ProspectStatus;
  aiScore: number;
  source: string;
  assignedAgentName?: string | null;
}

export interface ProspectListFilters {
  statuses: ProspectStatus[];
  assignedAgents: string[];
  sources: string[];
}

export interface ProspectListResponse {
  items: ProspectListItem[];
  total: number;
  page: number;
  pageSize: number;
  filters: ProspectListFilters;
}

export interface ProspectQueryParams {
  search?: string;
  status?: string;
  assignedAgent?: string;
  source?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateProspectPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  budget?: number | null;
  source: string;
  assignedAgentId?: number | null;
}

export type UpdateProspectPayload = CreateProspectPayload;

export interface ProspectInteraction {
  id: number;
  type: string;
  date: string;
  comment: string;
}

export interface ProspectMeeting {
  id: number;
  propertyId?: number | null;
  type: string;
  date: string;
  time: string;
  status: string;
  propertyTitle: string;
  outcome?: "AGREEMENT" | "NO_AGREEMENT" | null;
}

export interface ProspectWish {
  id: number;
  date: string;
  source: string;
  submitted: boolean;
  title: string;
  summary: string;
}

export type ProspectPropertyRelationStatus =
  | "FAVORITE"
  | "NEGOTIATING"
  | "ABANDONED"
  | "BOUGHT"
  | "RENTED";

export type ProspectPropertyInteractionType =
  | "FAVORITED"
  | "VISIT_REQUESTED"
  | "VISIT_COMPLETED"
  | "NEGOTIATION_STARTED"
  | "NEGOTIATION_CANCELLED"
  | "PURCHASE_COMPLETED"
  | "RENT_COMPLETED"
  | "DOCUMENT_ADDED"
  | "NOTE_ADDED";

export type ProspectPropertyDocumentType =
  | "BEFORE_SALE_DOCUMENT"
  | "BEFORE_RENTAL_DOCUMENT"
  | "SALE_DEED"
  | "LEASE_CONTRACT"
  | "LAND_TITLE"
  | "MORTGAGE_CONTRACT"
  | "PAYMENT_RECEIPT"
  | "RENT_RECEIPT"
  | "PROPERTY_INSPECTION_REPORT"
  | "SECURITY_DEPOSIT_RECEIPT"
  | "RECEIPT"
  | "CONTRACT"
  | "PAYMENT_PROOF"
  | "ID_COPY"
  | "OTHER";

export interface ProspectPropertyDocument {
  id: number;
  name: string;
  url: string;
  downloadPath: string;
  type: ProspectPropertyDocumentType;
  uploadedAt: string;
}

export interface ProspectPropertyExpectedDocument {
  type: ProspectPropertyDocumentType;
  title: string;
  description: string;
  sampleContent: string;
  uploaded: boolean;
}

export interface ProspectPropertyInteraction {
  id: number;
  type: ProspectPropertyInteractionType;
  comment: string;
  createdAt: string;
}

export interface ProspectPropertyRecord {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyType: string;
  propertySector: string;
  propertyPrice: number;
  propertyStatus: string;
  relationStatus: ProspectPropertyRelationStatus;
  finalPrice?: number | null;
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  leaseStartDate?: string | null;
  leaseDurationMonths?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  medias: string[];
  documents: ProspectPropertyDocument[];
  expectedDocuments: ProspectPropertyExpectedDocument[];
  interactions: ProspectPropertyInteraction[];
}

export interface ProspectDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  budgetLabel: string;
  budgetValue?: number | null;
  status: ProspectStatus;
  aiScore: number;
  source: string;
  assignedAgentName?: string | null;
  projectType: string;
  createdAt: string;
  notes: string;
  temperature: "HOT" | "WARM" | "COLD";
  leadScoreMetrics: {
    score: number;
    classification: "HOT" | "WARM" | "COLD";
    totalInteractions: number;
    propertyRelations: number;
    favoriteCount: number;
    confirmedMeetings: number;
    totalMeetings: number;
    messagesCount: number;
    negotiationCount: number;
    completeDossierCount: number;
    budget?: number | null;
    budgetGap: number;
  };
  propertyInsights: {
    propertyId: number;
    propertyTitle: string;
    relationStatus: ProspectPropertyRelationStatus;
    totalInteractions: number;
    favoriteCount: number;
    visitRequestedCount: number;
    visitCompletedCount: number;
    negotiationCount: number;
    documentCount: number;
    requestMeetingsCount: number;
    confirmedMeetingsCount: number;
    completedMeetingsCount: number;
    lastUpdatedAt: string;
  }[];
  interactions: ProspectInteraction[];
  meetings: ProspectMeeting[];
  wishes: ProspectWish[];
  propertyRecords: ProspectPropertyRecord[];
}

export interface CreateInteractionPayload {
  type: string;
  comment: string;
}

export interface AssignProspectPropertyPayload {
  prospectId: number;
  propertyId: number;
  status: ProspectPropertyRelationStatus;
  finalPrice?: number | null;
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  leaseStartDate?: string | null;
  leaseDurationMonths?: number | null;
  notes?: string | null;
}

export interface UpdateProspectPropertyPayload {
  status: ProspectPropertyRelationStatus;
  finalPrice?: number | null;
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  leaseStartDate?: string | null;
  leaseDurationMonths?: number | null;
  notes?: string | null;
}

export interface CreateProspectPropertyInteractionPayload {
  type: ProspectPropertyInteractionType;
  comment: string;
}
