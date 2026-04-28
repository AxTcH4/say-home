import { PipelineBoard } from "@/features/pipeline/components/PipelineBoard";
import { PipelineFilters } from "@/features/pipeline/components/PipelineFilters";
import { PipelineHeader } from "@/features/pipeline/components/PipelineHeader";
import { pipelineService } from "@/features/pipeline/services/pipeline.service";
import { requireAdminUser } from "@/shared/lib/server-auth";

type SearchParams = Promise<{
  assignedAgent?: string;
  city?: string;
  source?: string;
}>;

export default async function PipelinePage(props: { searchParams: SearchParams }) {
  await requireAdminUser();
  const searchParams = await props.searchParams;
  const board = await pipelineService.getBoard({
    assignedAgent: searchParams.assignedAgent,
    city: searchParams.city,
    source: searchParams.source,
  });

  return (
    <section className="space-y-6">
      <PipelineHeader lastUpdated={board.lastUpdated} />
      <PipelineFilters filters={board.filters} />
      <PipelineBoard board={board} />
    </section>
  );
}
