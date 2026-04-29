import { UserForm } from "@/features/users/components/UserForm";
import { userService } from "@/features/users/services/user.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const user = await userService.getUserById(Number(id));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          Edit User
        </h1>
        <p className="mt-2 text-sm text-[#70819a]">
          Update role and contact information for this user.
        </p>
      </div>

      <UserForm
        mode="edit"
        userId={user.id}
        initialValues={{
          firstName: user.fullName.split(" ").slice(0, -1).join(" ") || user.fullName,
          lastName: user.fullName.split(" ").slice(-1)[0] || "",
          email: user.email,
          phone: "",
          role: user.role === "Admin" ? "ADMIN" : "AGENT",
        }}
      />
    </section>
  );
}
