import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function Properties() {
  await requireAdminUser();
  return <div>Properties</div>;
}
