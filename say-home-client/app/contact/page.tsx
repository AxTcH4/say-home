"use client";

import ContactForm from "@/features/contact/components/ContactForm";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import { useEffect, useState } from "react";

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
    <section className=" px-6 py-12 md:px-10 md:pt-14">
      <div className="mb-[10vh]">
        <Navbar onHero={false} />
      </div>
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 text-center">
          <h1 className="text-[38px] font-semibold text-[#222222] md:text-[46px]">
            Contactez SAY HOME
          </h1>

          <p className="mx-auto mt-4 max-w-[760px] text-[16px] leading-7 text-[#555555]">
            Une question, une demande d’information ou un besoin d’assistance ?
            Envoyez-nous un message et notre équipe vous répondra dans les plus
            brefs délais.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ContactForm />

          <div className={`rounded-[2px] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 "}`}>
            <h2 className="text-[24px] font-semibold text-[#222222]">
              Nos coordonnées
            </h2>

            <div className="mt-8 space-y-6 text-[#555555]">
              <div>
                <p className="text-sm font-semibold text-[#222222]">Adresse</p>
                <p className="mt-2 text-sm">Marrakech, Maroc</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#222222]">
                  Téléphone
                </p>
                <p className="mt-2 text-sm">0687654321</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#222222]">Email</p>
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
