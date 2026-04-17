"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function AboutSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="about"
      className="flex w-full h-screen overflow-hidden"
    >
      {/* LEFT IMAGE */}
      <div
        className={`relative w-1/2 mt-[-50px] transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
      >
        <Image
          src="/riad.png"
          alt="Riad"
          fill
          sizes="50vw"
          className="object-cover object-center"
        />
      </div>

      {/* RIGHT CONTENT */}
      <div
        className={`relative w-[60%] bg-gray-100 flex flex-col justify-center transition-all duration-700 ease-out delay-150
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ paddingLeft: "clamp(1rem, 3vw, 3rem)" }}
      >
        <p
          className={`text-[#2C1A0E] uppercase tracking-widest mb-4 transition-all duration-700 delay-200
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ fontSize: "clamp(0.6rem, 1vw, 0.75rem)" }}
        >
          A propos
        </p>

        <h2
          className={`font-serif font-bold text-gray-900 mb-8 leading-tight max-w-[70%] transition-all duration-700 delay-300
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)" }}
        >
          Nous vous aidons à trouver le bien immobilier qui vous correspond vraiment.
        </h2>

        {/* IMAGE ROW */}
        <div
          className={`flex justify-end gap-10 px-8 my-7 transition-all duration-700 delay-400
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ height: "clamp(180px, 25vw, 39vh)" }}
        >
          <div className="flex flex-row gap-8 justify-end pe-8">
            <div className="relative w-[clamp(140px,18vw,280px)] h-full">
              <Image
                src="/cuisine.png"
                alt="Cuisine"
                fill
                sizes="18vw"
                className="object-cover"
              />
            </div>

            <div className="relative w-[clamp(140px,18vw,280px)] h-[75%]">
              <Image
                src="/salon.png"
                alt="Salon"
                fill
                sizes="18vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <p
          className={`text-gray-500 leading-relaxed max-w-2xl transition-all duration-700 delay-500
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.875rem)" }}
        >
          Chez Say Home, nous mettons en relation acheteurs et vendeurs avec simplicité et transparence. Que vous cherchiez un appartement en ville ou une villa en banlieue, notre plateforme vous offre les meilleures offres du marché marocain.
        </p>
      </div>
    </section>
  );
}