"use client";

import Image from "next/image";
import RevealSection from "./RevealSection";

export default function AboutGallerySection() {
  return (
    <div className="bg-[#fcfaf6]">
      <RevealSection className="mx-auto max-w-7xl px-6 pt-8 pb-24 lg:px-10 lg:pt-10 lg:pb-28">
        <section className="overflow-hidden rounded-[1.6rem] border border-[#e8ddd0] bg-white shadow-[0_20px_45px_rgba(47,27,16,0.08)]">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative min-h-[360px] lg:min-h-[620px]">
              <Image
                src="/riad.png"
                alt="Riad Marrakech"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="bg-white px-6 py-8 lg:px-12 lg:py-10">
              <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#9f7759]">
                <span>02</span>
                <span className="h-px w-9 bg-[#ccb7a4]" />
                <span className="text-[#8d7d6f]">Selection interieure</span>
              </div>

              <h2 className="mt-5 max-w-3xl text-[clamp(1.7rem,2.5vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#2b1d14]">
                Nous vous aidons a trouver le bien immobilier qui vous correspond vraiment.
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-[1.04fr_0.96fr]">
                <div className="relative min-h-[230px] overflow-hidden rounded-[0.75rem]">
                  <Image
                    src="/cuisine.png"
                    alt="Cuisine moderne"
                    fill
                    sizes="(min-width: 640px) 22vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="relative min-h-[230px] overflow-hidden rounded-[0.75rem]">
                  <Image
                    src="/salon.png"
                    alt="Salon decor"
                    fill
                    sizes="(min-width: 640px) 20vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-[#6a5f56]">
                Chez Say Home, nous mettons en relation acheteurs et vendeurs
                avec simplicite et transparence. Que vous cherchiez un appartement
                en ville ou une villa en banlieue, notre plateforme vous offre les
                meilleures offres du marche marocain.
              </p>
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}
