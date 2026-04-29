import Link from "next/link";
import { ProspectDetailHeader } from "@/features/prospects/components/ProspectDetailHeader";
import { ProspectDetailTabs } from "@/features/prospects/components/ProspectDetailTabs";
import { ProspectPrimaryInfo } from "@/features/prospects/components/ProspectPrimaryInfo";
import { prospectService } from "@/features/prospects/services/prospect.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const prospect = await prospectService.getProspectById(Number(id));

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#70819a]">
        <Link href="/prospects" className="font-medium hover:text-[#172033]">
          Prospects
        </Link>
        <span>/</span>
        <span>{prospect.fullName}</span>
      </div>

      <ProspectDetailHeader prospect={prospect} />
      <ProspectPrimaryInfo prospect={prospect} />
      <ProspectDetailTabs prospect={prospect} />
    </section>
  );
}
