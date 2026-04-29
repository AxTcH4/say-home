import { CreateProspectForm } from "@/features/prospects/components/CreateProspectForm";
import { userService } from "@/features/users/services/user.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function NewProspectPage() {
  await requireAdminUser();
  const users = await userService.getUsers();
  const assignableAgents = users.items.filter((user) => user.role !== "Admin");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          Add Prospect
        </h1>
        <p className="mt-2 text-sm text-[#70819a]">
          Create a prospect manually and assign it to an agent if needed.
        </p>
      </div>

      <CreateProspectForm agents={assignableAgents} />
    </section>
  );
}
