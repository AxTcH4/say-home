import { CreateProspectForm } from "@/features/prospects/components/CreateProspectForm";
import { prospectService } from "@/features/prospects/services/prospect.service";
import { userService } from "@/features/users/services/user.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function EditProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [prospect, users] = await Promise.all([
    prospectService.getProspectById(Number(id)),
    userService.getUsers(),
  ]);

  const assignableAgents = users.items.filter((user) => user.role !== "Admin");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          Edit Prospect
        </h1>
        <p className="mt-2 text-sm text-[#70819a]">
          Update the assigned agent and the key qualification data.
        </p>
      </div>

      <CreateProspectForm
        agents={assignableAgents}
        mode="edit"
        prospectId={prospect.id}
        initialValues={{
          firstName: prospect.fullName.split(" ").slice(0, -1).join(" ") || prospect.fullName,
          lastName: prospect.fullName.split(" ").slice(-1)[0] || "",
          email: prospect.email,
          phone: prospect.phone,
          city: prospect.city,
          budget: prospect.budgetValue ?? null,
          source: prospect.source,
          assignedAgentId:
            assignableAgents.find((agent) => agent.fullName === prospect.assignedAgentName)?.id ??
            null,
        }}
      />
    </section>
  );
}
