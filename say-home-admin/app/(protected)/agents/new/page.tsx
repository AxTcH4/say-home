import { UserForm } from "@/features/users/components/UserForm";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default function NewAgentPage() {
  return requireAdminPage();
}

async function requireAdminPage() {
  await requireAdminUser();
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          Add Agent
        </h1>
        <p className="mt-2 text-sm text-[#70819a]">
          Create a new agent account for the back-office.
        </p>
      </div>

      <UserForm mode="create" />
    </section>
  );
}
