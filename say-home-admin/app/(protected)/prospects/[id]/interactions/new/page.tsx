import { AddInteractionForm } from "@/features/prospects/components/AddInteractionForm";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function NewInteractionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">Add Interaction</h1>
        <p className="mt-2 text-sm text-[#70819a]">Log a new call, note, email or visit for this prospect.</p>
      </div>
      <AddInteractionForm prospectId={Number(id)} />
    </section>
  );
}
