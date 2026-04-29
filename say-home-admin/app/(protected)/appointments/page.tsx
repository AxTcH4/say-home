import { AppointmentsBoard } from "@/features/meetings/components/AppointmentsBoard";
import { meetingService } from "@/features/meetings/services/meeting.service";

export default async function AppointmentsPage() {
  const board = await meetingService.getBoard();

  return <AppointmentsBoard board={board} />;
}
