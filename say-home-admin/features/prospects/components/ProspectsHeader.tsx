interface ProspectsHeaderProps {
  total: number;
}

export function ProspectsHeader({ total }: ProspectsHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
        Prospects
      </h1>
      <p className="text-sm text-[#70819a]">
        {total.toLocaleString()} total prospects found in database
      </p>
    </div>
  );
}
