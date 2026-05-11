"use client";

import { BadgeCheck, Building2, MapPinned, Sparkles } from "lucide-react";
import RevealSection from "./RevealSection";

export default function HomeStatsProcess() {
  return (
    <div className="bg-[#fcfaf6]">
      <RevealSection className="mx-auto max-w-7xl px-6 py-18 lg:px-10">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { label: "Biens premium", value: "120+", detail: "Selectionnes a la main", icon: Building2 },
            { label: "Secteurs suivis", value: "18", detail: "A travers le Maroc", icon: MapPinned },
            { label: "Visites traitees", value: "350+", detail: "Depuis le lancement", icon: BadgeCheck },
            { label: "Matching rapide", value: "<24h", detail: "Reponse de l'equipe", icon: Sparkles },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-[2px] border border-[#e5ddd2] bg-[#2f1b10] p-6 text-white shadow-[0_18px_35px_rgba(47,27,16,0.12)]"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <Icon className="h-5 w-5 text-[#d7aa86]" />
                <p className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-white">{item.value}</p>
                <p className="mt-3 text-lg font-semibold text-white">{item.label}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto grid max-w-7xl gap-12 px-6 py-18 lg:grid-cols-[1fr_1.05fr] lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8d7d6f]">
            Une experience plus fluide
          </p>
          <h2 className="mt-4 max-w-5xl text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-[#22160f]">
            On ne vous montre pas juste des biens.
            <span className="mt-2 block font-serif italic text-[#9e8f82]">
              On vous aide a prendre une vraie decision.
            </span>
          </h2>
          <p className="mt-8 max-w-xl text-sm leading-8 text-[#6a5f56]">
            Notre approche relie catalogue, accompagnement humain et suivi de visite pour garder votre recherche simple, rapide et credible.
          </p>
        </div>

        <div className="grid gap-6 pt-6 md:grid-cols-3 md:items-start">
          {[
            {
              step: "01",
              title: "Explorer",
              copy: "Comparez rapidement les typologies, secteurs et budgets qui vous correspondent.",
            },
            {
              step: "02",
              title: "Reserver",
              copy: "Envoyez une demande de visite depuis la fiche du bien, puis laissez l'equipe la valider.",
            },
            {
              step: "03",
              title: "Concretiser",
              copy: "Suivez vos demandes et echangez avec l'equipe pour avancer sans friction.",
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className="border-t border-[#e2d7ca] pt-8"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <div className="flex items-center gap-4">
                <span className="font-serif text-6xl italic tracking-[-0.06em] text-[#b87650]">
                  {item.step}
                </span>
                <span className="h-2 w-2 rounded-full bg-[#2f1b10]" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold text-[#22160f]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#6a5f56]">{item.copy}</p>
            </div>
          ))}
        </div>
      </RevealSection>
    </div>
  );
}
