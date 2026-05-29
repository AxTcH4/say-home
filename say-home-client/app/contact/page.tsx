"use client";

import ContactForm from "@/features/contact/components/ContactForm";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";

export default function ContactPage() {
  return (
    <>
      <section className="min-h-screen bg-[#fcfbf8] px-6 py-12 text-[#241912] md:px-10 md:pt-14">
        <div className="mb-[10vh]">
          <Navbar onHero={false} />
        </div>

        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 rounded-[28px] border border-[#e7ddd2] bg-[linear-gradient(135deg,#fbf7f1,#fffdfa)] px-8 py-10 text-center shadow-[0_18px_40px_rgba(47,27,16,0.08)]">
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-[#8b786a] md:text-[13px]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Parlons de votre projet
            </p>
            <h1
              className="mt-4 text-[38px] font-semibold text-[#241912] md:text-[56px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Contactez SAY HOME
            </h1>

            <p
              className="mx-auto mt-4 max-w-[760px] text-[16px] leading-7 text-[#64584f]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Une question, une demande d'information ou un besoin d'assistance ?
              Envoyez-nous un message et notre équipe vous répondra dans les plus
              brefs délais.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <ContactForm />

            <div className="rounded-[24px] border border-[#e7ddd2] bg-white p-8 shadow-[0_18px_40px_rgba(47,27,16,0.08)] transition-all duration-700 ease-out">
              <h2
                className="text-[26px] font-semibold text-[#241912]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Nos coordonnées
              </h2>

              <div
                className="mt-8 space-y-6 text-[#64584f]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8b786a]">
                    Adresse
                  </p>
                  <p className="mt-2 text-sm">Marrakech, Maroc</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8b786a]">
                    Téléphone
                  </p>
                  <p className="mt-2 text-sm">0687654321</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8b786a]">
                    Email
                  </p>
                  <p className="mt-2 text-sm">sayhome.app@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
