"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, MapPinned, Sparkles } from "lucide-react";

export default function HomeHighlights() {
  return (
    <div className="bg-[#fcfaf6]">
      <RevealSection className="mx-auto max-w-7xl px-6 py-18 lg:px-10">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { label: "Biens premium", value: "120+", icon: Building2 },
            { label: "Secteurs suivis", value: "18", icon: MapPinned },
            { label: "Visites traitees", value: "350+", icon: BadgeCheck },
            { label: "Matching rapide", value: "< 24h", icon: Sparkles },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-[2px] border border-[#e5ddd2] bg-white p-5 shadow-[0_16px_30px_rgba(47,27,16,0.06)]"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <Icon className="h-5 w-5 text-[#2f1b10]" />
                <p className="mt-5 text-3xl font-semibold text-[#22160f]">{item.value}</p>
                <p className="mt-2 text-sm text-[#6a5f56]">{item.label}</p>
              </div>
            );
          })}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto grid max-w-7xl gap-10 px-6 py-18 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8d7d6f]">
            Une experience plus fluide
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#22160f]">
            On ne vous montre pas juste des biens. On vous aide a prendre une vraie decision.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#6a5f56]">
            Notre approche relie catalogue, accompagnement humain et suivi de visite pour garder votre recherche simple, rapide et credible.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
              className="group rounded-[2px] border border-[#e5ddd2] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(47,27,16,0.10)]"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b8c7f]">
                {item.step}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-[#22160f]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6a5f56]">{item.copy}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <div className="overflow-hidden rounded-[2px] border border-[#dfd3c5] bg-gradient-to-r from-[#2f1b10] via-[#473022] to-[#2f1b10] px-6 py-10 text-white shadow-[0_20px_45px_rgba(47,27,16,0.20)] lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                Say Home Selection
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                Vous voulez aller plus vite sur votre prochaine visite ?
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Parcourez les biens, envoyez vos demandes et laissez l&apos;equipe confirmer les visites selon les disponibilites.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-[2px] bg-white px-5 py-3 text-sm font-semibold text-[#2f1b10] transition hover:translate-x-1"
            >
              Voir les proprietes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.18 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className ?? ""} transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
