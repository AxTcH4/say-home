import RealEstateTabs from "@/modules/account/components/RealEstateTabs";

export default function RealEstatePage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-[32px] font-semibold text-[#222222]">
          Mon espace immobilier
        </h1>

        <p className="mt-2 text-sm text-[#666666]">
          Consultez vos biens, vos visites et vos negotiations
        </p>
      </div>

      <RealEstateTabs />
    </section>
  );
}
