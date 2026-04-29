import { MeetingForm } from "@/features/meetings/components/MeetingForm";
import { prospectService } from "@/features/prospects/services/prospect.service";
import { userService } from "@/features/users/services/user.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function NewMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ prospectId?: string }>;
}) {
  await requireAdminUser();
  const [prospects, users, params] = await Promise.all([
    prospectService.getProspects({}),
    userService.getUsers(),
    searchParams,
  ]);
  const agents = users.items.filter((user) => user.role !== "Admin");
  const initialProspectId = params.prospectId ? Number(params.prospectId) : prospects.items[0]?.id ?? 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">Plan Meeting</h1>
        <p className="mt-2 text-sm text-[#70819a]">Schedule a new meeting and assign it to an agent.</p>
      </div>
      <MeetingForm
        agents={agents}
        prospects={prospects.items}
        mode="create"
        initialValues={{
          prospectId: initialProspectId,
          agentId: agents[0]?.id ?? 0,
          propertyId: null,
          date: "",
          time: "",
          meetingType: "Call",
          notes: "",
        }}
      />
    </section>
  );
}
