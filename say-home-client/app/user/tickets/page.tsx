import TicketsList from "@/features/user/components/TicketsList";

export default function TicketsPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-[32px] font-semibold text-[#222222]">
          Mes tickets
        </h1>

        <p className="mt-2 text-sm text-[#666666]">
          Suivez vos demandes et reclamations
        </p>
      </div>

      <TicketsList />
    </section>
  );
}
