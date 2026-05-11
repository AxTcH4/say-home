"use client";

import { ArrowRight, Check } from "lucide-react";
import RevealSection from "./RevealSection";

export default function HomeVisitCta() {
  return (
    <div className="bg-[#fcfaf6]">
      <RevealSection className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#3a2416] px-8 py-12 text-white shadow-[0_24px_50px_rgba(47,27,16,0.18)] lg:px-14 lg:py-16">
          <div className="absolute bottom-[-64px] right-[-30px] h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute bottom-[-20px] right-[35px] h-44 w-44 rounded-full border border-white/10" />
          <div className="absolute bottom-[28px] right-[78px] h-28 w-28 rounded-full border border-white/10" />
          <div className="absolute bottom-0 right-0 h-52 w-52 bg-[radial-gradient(circle,rgba(199,127,82,0.28),transparent_65%)]" />

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#af9f93]">
                <span className="h-px w-10 bg-[#af9f93]" />
                Say Home Selection
              </div>
              <h2 className="mt-8 max-w-3xl text-[clamp(2rem,4vw,4rem)] font-semibold leading-[1] tracking-[-0.05em]">
                Vous voulez aller plus vite sur votre prochaine visite ?
              </h2>
              <p className="mt-6 max-w-2xl text-[clamp(1rem,1.4vw,1.4rem)] leading-8 text-white/78">
                Parcourez les biens, envoyez vos demandes et laissez l'equipe confirmer les visites selon les disponibilites.
              </p>

              <a
                href="/properties"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#2f1b10] transition duration-300 hover:-translate-y-0.5 hover:translate-x-1"
              >
                Voir les proprietes <ArrowRight className="h-5 w-5" />
              </a>
            </div>

            <div className="border-[#6e5748] lg:border-l lg:pl-10">
              <div className="space-y-6">
                {[
                  "Demande de visite en quelques clics",
                  "Confirmation par l'equipe sous 24h",
                  "Suivi de chaque dossier centralise",
                  "Accompagnement humain de A a Z",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b87650] text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-lg text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
