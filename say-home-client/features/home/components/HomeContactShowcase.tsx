"use client";

import Link from "next/link";
import { Building2, Check, Home, KeyRound } from "lucide-react";
import RevealSection from "./RevealSection";

const cards = [
  {
    title: "Vendre votre bien",
    copy: "Estimation gratuite et mise en avant aupres de notre reseau d'acheteurs qualifies.",
    icon: Building2,
    href: "/contact",
    className: "lg:ml-24",
  },
  {
    title: "Acheter un bien",
    copy: "Selection sur-mesure selon vos criteres, budget et secteur cible au Maroc.",
    icon: Home,
    href: "/properties",
    className: "lg:-mt-6 lg:mr-20",
  },
  {
    title: "Louer en confiance",
    copy: "Baux verifies, etats des lieux et accompagnement administratif inclus.",
    icon: KeyRound,
    href: "/contact",
    className: "lg:ml-24",
  },
];

export default function HomeContactShowcase() {
  return (
    <div className="bg-[#fcfaf6]">
      <RevealSection className="mx-auto max-w-7xl px-6 pt-6 pb-16 lg:px-10 lg:pt-8 lg:pb-20">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="max-w-[610px] pt-8">
            <h2 className="font-serif text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-[#2b1d14]">
              Nous aidons nos clients a acheter, vendre ou louer leur bien sans friction.
            </h2>

            <p className="mt-7 max-w-xl text-[clamp(0.98rem,1.1vw,1.08rem)] leading-8 text-[#6a5f56]">
              Forte de son expertise du marche marocain, notre equipe accompagne acheteurs et vendeurs avec exigence et transparence. Nous selectionnons, verifions et negocions a vos cotes.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Support 7j/7 disponible",
                "Accompagnement juridique expert",
                "Mise en ligne gratuite sur la plateforme",
                "Aide au financement et pret immobilier",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 text-[#5d534c]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b87650] text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-[1.02rem]">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/contact"
              className="mt-10 inline-flex items-center rounded-full bg-[#b87650] px-10 py-4 text-base font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#a86d4b]"
            >
              Nous contacter
            </Link>
          </div>

          <div className="relative flex min-h-[820px] items-start justify-end">
            <div className="grid w-full max-w-[960px] gap-10">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className={`rounded-[1.9rem] border border-[#e8dccf] bg-white px-10 py-9 shadow-[0_18px_40px_rgba(47,27,16,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(47,27,16,0.12)] ${card.className}`}
                  >
                    <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-[#f4ece4] text-[#c0865f]">
                      <Icon className="h-9 w-9" />
                    </div>
                    <h3 className="mt-7 font-serif text-[clamp(2.2rem,2.9vw,2.9rem)] font-semibold tracking-[-0.04em] text-[#2b1d14]">
                      {card.title}
                    </h3>
                    <p className="mt-5 max-w-lg text-[clamp(1.04rem,1.18vw,1.14rem)] leading-9 text-[#6a5f56]">
                      {card.copy}
                    </p>
                    <Link href={card.href} className="mt-8 inline-block text-[1.02rem] text-[#94857a] transition hover:text-[#2b1d14]">
                      En savoir plus
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
