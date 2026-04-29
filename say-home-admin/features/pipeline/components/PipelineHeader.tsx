interface PipelineHeaderProps {
  lastUpdated: string;
}

export function PipelineHeader({ lastUpdated }: PipelineHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          Pipeline
        </h1>
        <p className="text-sm text-[#70819a]">
          Track prospects through each stage of the sales cycle.
        </p>
      </div>

      <p className="text-sm text-[#70819a]">Last updated: {lastUpdated}</p>
    </div>
  );
}
