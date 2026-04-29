import { requireAdminUser } from "@/shared/lib/server-auth";

export default function AiMatchingPage() {
  return renderPage();
}

async function renderPage() {
  await requireAdminUser();
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          AI Matching
        </h1>
        <p className="mt-2 text-sm text-[#70819a]">
          Analyse intelligente des prospects et recommandations d&apos;affectation.
        </p>
      </div>

      <div className="rounded-[18px] border border-[#e7edf5] bg-white px-6 py-8 shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#376fd9]">
            Back-office
          </span>
          <h2 className="text-2xl font-semibold text-[#172033]">
            Module AI Matching en preparation
          </h2>
          <p className="text-sm leading-6 text-[#61728b]">
            Cette section servira a proposer des correspondances entre prospects,
            agents et opportunites selon le score IA, la ville, le budget et
            l&apos;historique d&apos;interactions.
          </p>
        </div>
      </div>
    </section>
  );
}
