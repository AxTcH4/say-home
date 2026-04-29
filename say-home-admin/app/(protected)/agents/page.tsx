import { UsersHeader } from "@/features/users/components/UsersHeader";
import { UsersTable } from "@/features/users/components/UsersTable";
import { userService } from "@/features/users/services/user.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function AgentsPage() {
  await requireAdminUser();
  const data = await userService.getUsers();

  return (
    <section className="space-y-6">
      <UsersHeader total={data.total} />
      <UsersTable users={data.items} total={data.total} />
    </section>
  );
}
