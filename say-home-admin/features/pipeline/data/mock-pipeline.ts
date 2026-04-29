import type { PipelineBoardResponse } from "../types/pipeline.types";

export const mockPipelineBoard: PipelineBoardResponse = {
  lastUpdated: "5 minutes ago",
  filters: {
    assignedAgents: ["Sarah Miller", "Marc Durand", "Lucile Blanc"],
    cities: ["Rabat", "Agadir", "Marrakech", "Tanger"],
    sources: ["Website", "Referral", "Phone", "Walk-in"],
  },
  columns: [
    {
      key: "NEW",
      title: "New Lead",
      count: 12,
      color: "#8fb0ff",
      prospects: [
        {
          id: 1,
          fullName: "Julien Moreau",
          city: "Bordeaux",
          budgetLabel: "450k Budget",
          aiScore: 94,
          assignedAgentName: "Sarah Miller",
          status: "NEW",
        },
        {
          id: 2,
          fullName: "Sophie Bernard",
          city: "Pessac",
          budgetLabel: "280k Budget",
          aiScore: 72,
          assignedAgentName: "Sarah Miller",
          status: "NEW",
        },
      ],
    },
    {
      key: "CONTACTED",
      title: "Contacted",
      count: 8,
      color: "#7aa8ff",
      prospects: [
        {
          id: 3,
          fullName: "Marc Lefebvre",
          city: "Bordeaux",
          budgetLabel: "320k Budget",
          aiScore: 88,
          assignedAgentName: "Marc Durand",
          status: "CONTACTED",
        },
        {
          id: 4,
          fullName: "Camille Petit",
          city: "Talence",
          budgetLabel: "510k Budget",
          aiScore: 81,
          assignedAgentName: "Lucile Blanc",
          status: "CONTACTED",
        },
      ],
    },
    {
      key: "QUALIFIED",
      title: "Visit Scheduled",
      count: 5,
      color: "#9186ff",
      prospects: [
        {
          id: 5,
          fullName: "Laurent Dubois",
          city: "Bordeaux Center",
          budgetLabel: "620k Budget",
          aiScore: 96,
          assignedAgentName: "Sarah Miller",
          status: "QUALIFIED",
        },
      ],
    },
    {
      key: "NEGOTIATING",
      title: "Negotiation",
      count: 3,
      color: "#f3be4b",
      prospects: [
        {
          id: 6,
          fullName: "Emma Leroy",
          city: "Merignac",
          budgetLabel: "390k Budget",
          aiScore: 91,
          assignedAgentName: "Marc Durand",
          status: "NEGOTIATING",
        },
      ],
    },
    {
      key: "CONVERTED",
      title: "Won",
      count: 14,
      color: "#63d1a6",
      prospects: [
        {
          id: 7,
          fullName: "Thomas Girard",
          city: "Chartrons",
          budgetLabel: "740k Budget",
          aiScore: 100,
          assignedAgentName: "Sarah Miller",
          status: "CONVERTED",
        },
      ],
    },
    {
      key: "LOST",
      title: "Lost",
      count: 2,
      color: "#f37c8a",
      prospects: [
        {
          id: 8,
          fullName: "Nathalie Roux",
          city: "Cenon",
          budgetLabel: "210k Budget",
          aiScore: 18,
          assignedAgentName: "Lucile Blanc",
          status: "LOST",
        },
      ],
    },
  ],
};
