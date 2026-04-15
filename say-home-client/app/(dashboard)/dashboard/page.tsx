import DashboardCards from "@/modules/account/components/DashboardCards";

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-[#6f5c4e]">Espace client</p>
        <h1 className="mt-2 text-[38px] font-semibold text-[#222222]">
          Mon espace
        </h1>

        <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#666666]">
          Accedez rapidement a votre profil, vos biens immobiliers et vos
          demandes d'assistance.
        </p>
      </div>

      <DashboardCards />
    </section>
  );
}
