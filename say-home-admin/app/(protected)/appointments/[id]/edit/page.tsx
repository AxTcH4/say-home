import { MeetingForm } from "@/features/meetings/components/MeetingForm";
import { meetingService } from "@/features/meetings/services/meeting.service";
import { prospectService } from "@/features/prospects/services/prospect.service";
import { userService } from "@/features/users/services/user.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [appointment, prospects, users] = await Promise.all([
    meetingService.getAppointment(Number(id)),
    prospectService.getProspects({}),
    userService.getUsers(),
  ]);
  const agents = users.items.filter((user) => user.role !== "Admin");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">Edit Meeting</h1>
        <p className="mt-2 text-sm text-[#70819a]">Update details or reassign this meeting.</p>
      </div>
      <MeetingForm
        agents={agents}
        prospects={prospects.items}
        mode="edit"
        appointmentId={appointment.id}
        initialValues={{
          prospectId: appointment.prospectId,
          agentId: appointment.agentId,
          propertyId: appointment.propertyId ?? null,
          date: appointment.date,
          time: appointment.time.slice(0, 5),
          meetingType: appointment.meetingType || "Call",
          notes: appointment.notes || "",
        }}
      />
    </section>
  );
}
