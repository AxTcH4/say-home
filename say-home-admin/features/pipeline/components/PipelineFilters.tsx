import type { PipelineFilters as PipelineFiltersType } from "../types/pipeline.types";

interface PipelineFiltersProps {
  filters: PipelineFiltersType;
}

export function PipelineFilters({ filters }: PipelineFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <select
        name="assignedAgent"
        className="min-h-11 rounded-[10px] border border-[#e7edf5] bg-white px-4 text-sm text-[#172033] outline-none"
        defaultValue=""
      >
        <option value="">All Agents</option>
        {filters.assignedAgents.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>

      <select
        name="city"
        className="min-h-11 rounded-[10px] border border-[#e7edf5] bg-white px-4 text-sm text-[#172033] outline-none"
        defaultValue=""
      >
        <option value="">All Cities</option>
        {filters.cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <select
        name="source"
        className="min-h-11 rounded-[10px] border border-[#e7edf5] bg-white px-4 text-sm text-[#172033] outline-none"
        defaultValue=""
      >
        <option value="">All Sources</option>
        {filters.sources.map((source) => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>
    </div>
  );
}
