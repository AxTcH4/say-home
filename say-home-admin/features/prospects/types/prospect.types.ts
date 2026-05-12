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

export interface UpdateProspectPayload extends CreateProspectPayload {}

export interface ProspectInteraction {
  id: number;
  type: string;
  date: string;
  comment: string;
}

export interface ProspectMeeting {
  id: number;
  type: string;
  date: string;
  time: string;
  status: string;
}

export interface ProspectFeedback {
  id: number;
  date: string;
  satisfaction: string;
  comment: string;
}

export type ProspectPropertyRelationStatus =
  | "FAVORITE"
  | "NEGOTIATING"
  | "BOUGHT"
  | "RENTED";

export type ProspectPropertyDocumentType =
  | "RECEIPT"
  | "CONTRACT"
  | "PAYMENT_PROOF"
  | "ID_COPY"
  | "OTHER";

export interface ProspectPropertyDocument {
  id: number;
  name: string;
  url: string;
  type: ProspectPropertyDocumentType;
  uploadedAt: string;
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
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  medias: string[];
  documents: ProspectPropertyDocument[];
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
  interactions: ProspectInteraction[];
  meetings: ProspectMeeting[];
  feedback: ProspectFeedback[];
  propertyRecords: ProspectPropertyRecord[];
}

export interface CreateInteractionPayload {
  type: string;
  comment: string;
}
