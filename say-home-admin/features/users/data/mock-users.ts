import type { AdminUsersResponse } from "../types/user.types";

export const mockUsersResponse: AdminUsersResponse = {
  total: 4,
  items: [
    {
      id: 1,
      fullName: "Sarah Miller",
      email: "sarah.m@immobilier.fr",
      phone: "+212600111111",
      role: "Admin",
      activeProspects: 42,
      active: true,
    },
    {
      id: 2,
      fullName: "Marc Durand",
      email: "m.durand@immobilier.fr",
      phone: "+212600222222",
      role: "Agent Senior",
      activeProspects: 28,
      active: true,
    },
    {
      id: 3,
      fullName: "Lucile Blanc",
      email: "l.blanc@immobilier.fr",
      phone: "+212600333333",
      role: "Agent Junior",
      activeProspects: 15,
      active: true,
    },
    {
      id: 4,
      fullName: "Thomas Petit",
      email: "t.petit@immobilier.fr",
      phone: "+212600444444",
      role: "Agent Senior",
      activeProspects: 0,
      active: false,
    },
  ],
};
