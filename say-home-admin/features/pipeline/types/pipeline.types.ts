export interface PipelineCard {
  id: number;
  fullName: string;
  city: string;
  budgetLabel: string;
  aiScore: number;
  assignedAgentName?: string | null;
  status: string;
}

export interface PipelineColumn {
  key: string;
  title: string;
  count: number;
  color: string;
  prospects: PipelineCard[];
}

export interface PipelineFilters {
  assignedAgents: string[];
  cities: string[];
  sources: string[];
}

export interface PipelineBoardResponse {
  columns: PipelineColumn[];
  filters: PipelineFilters;
  lastUpdated: string;
}

export interface PipelineQueryParams {
  assignedAgent?: string;
  city?: string;
  source?: string;
}

export interface UpdatePipelineStatusPayload {
  prospectId: number;
  status: string;
}
