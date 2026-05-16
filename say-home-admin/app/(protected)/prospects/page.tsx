import { ProspectFilters } from "@/features/prospects/components/ProspectFilters";
import { ProspectsHeader } from "@/features/prospects/components/ProspectsHeader";
import { ProspectsTable } from "@/features/prospects/components/ProspectsTable";
import { prospectService } from "@/features/prospects/services/prospect.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

type SearchParams = Promise<{
  search?: string;
  status?: string;
  assignedAgent?: string;
  source?: string;
  page?: string;
}>;

export default async function ProspectsPage(props: {
  searchParams: SearchParams;
}) {
  await requireAdminUser();
  const searchParams = await props.searchParams;
  const data = await prospectService.getProspects({
    search: searchParams.search,
    status: searchParams.status,
    assignedAgent: searchParams.assignedAgent,
    source: searchParams.source,
    page: Number(searchParams.page ?? "1"),
    pageSize: 10,
  });

  return (
    <section className="space-y-6">
      <ProspectsHeader total={data.total} />
      <ProspectFilters
        filters={data.filters}
        currentFilters={{
          search: searchParams.search ?? "",
          status: searchParams.status ?? "",
          assignedAgent: searchParams.assignedAgent ?? "",
          source: searchParams.source ?? "",
        }}
      />
      <ProspectsTable
        prospects={data.items}
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        searchParams={{
          search: searchParams.search,
          status: searchParams.status,
          assignedAgent: searchParams.assignedAgent,
          source: searchParams.source,
        }}
      />
    </section>
  );
}
