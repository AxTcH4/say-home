"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { animate, stagger } from "animejs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getAllProperties, type PropertyListItem } from "@/shared/lib/api";

gsap.registerPlugin(ScrollTrigger);

const FILTERS = [
  { key: "villa-sale", label: "Villas a vendre", type: "VILLA", offerType: "SALE" },
  { key: "villa-rent", label: "Villas a louer", type: "VILLA", offerType: "RENT" },
  { key: "app-sale", label: "Appartements a vendre", type: "APPARTEMENT", offerType: "SALE" },
  { key: "app-rent", label: "Appartements a louer", type: "APPARTEMENT", offerType: "RENT" },
  { key: "riad-sale", label: "Riads a vendre", type: "RIAD", offerType: "SALE" },
  { key: "riad-rent", label: "Riads a louer", type: "RIAD", offerType: "RENT" },
] as const;

const HERO_HEADLINE = "Trouvez le lieu qui vous inspire";

const TYPE_LABELS: Record<string, string> = {
  RIAD: "Riad",
  VILLA: "Villa",
  APPARTEMENT: "Appartement",
  STUDIO: "Studio",
};

const SECTEUR_LABELS: Record<string, string> = {
  GUELIZ: "Gueliz",
  PALMERAIE: "Palmeraie",
  TARGA: "Targa",
  MEDINA: "Medina",
  ROUTE_D_OURIKA: "Route d'Ourika",
  AGDAL: "Agdal",
  HIVERNAGE: "Hivernage",
  MABROUKA: "Mabrouka",
};

type FilterKey = (typeof FILTERS)[number]["key"];

function formatPrice(value?: number | null, offerType?: string | null) {
  if (!value) return "Sur demande";
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
  return offerType === "RENT" ? `${formatted} MAD / mois` : `${formatted} MAD`;
}

function formatSurface(value?: number | null) {
  return value ? `${value} m2` : "Surface N/A";
}

function formatRooms(value?: number | null) {
  return value ? `${value} ch.` : "Pieces N/A";
}

function splitHeadline(text: string) {
  return text.split(" ").map((word, index, array) => (
    <span
      key={`${word}-${index}`}
      className="hero-word about-word latest-word inline-block will-change-transform"
      style={{ opacity: 0, transform: "translateY(40px)" }}
    >
      {word}
      {index < array.length - 1 ? "\u00A0" : ""}
    </span>
  ));
}

export default function CinematicHome() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroArchRef = useRef<HTMLDivElement | null>(null);
  const heroInteriorRef = useRef<HTMLDivElement | null>(null);
  const heroPortalRef = useRef<HTMLDivElement | null>(null);
  const heroShadeRef = useRef<HTMLDivElement | null>(null);
  const heroMistRef = useRef<HTMLDivElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const heroLabelRef = useRef<HTMLParagraphElement | null>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement | null>(null);
  const heroCtaRef = useRef<HTMLDivElement | null>(null);
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const aboutBackgroundRef = useRef<HTMLDivElement | null>(null);
  const aboutContentRef = useRef<HTMLDivElement | null>(null);
  const aboutLabelRef = useRef<HTMLParagraphElement | null>(null);
  const aboutBodyRef = useRef<HTMLDivElement | null>(null);
  const aboutImagesRef = useRef<HTMLDivElement | null>(null);
  const latestSectionRef = useRef<HTMLElement | null>(null);
  const latestBackgroundRef = useRef<HTMLDivElement | null>(null);
  const latestTitleRef = useRef<HTMLDivElement | null>(null);
  const latestTabsRef = useRef<HTMLDivElement | null>(null);
  const latestCardsRef = useRef<HTMLDivElement | null>(null);
  const latestLinkRef = useRef<HTMLDivElement | null>(null);
  const aboutEnteredRef = useRef(false);
  const latestEnteredRef = useRef(false);

  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>(FILTERS[0].key);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProperties() {
      try {
        const data = await getAllProperties();
        if (mounted) {
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Unable to load home properties", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProperties();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const currentFilter = FILTERS.find((filter) => filter.key === activeFilter) ?? FILTERS[0];
    const matching = properties.filter((property) => {
      return property.type === currentFilter.type && property.offerType === currentFilter.offerType;
    });

    if (matching.length > 0) {
      return matching.slice(0, 3);
    }

    return properties.slice(0, 3);
  }, [activeFilter, properties]);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      const setupSceneAnimations = (isMobile: boolean) => {
        const translateUnit = isMobile ? 20 : 40;
        const titleTranslate = isMobile ? 15 : 30;
        const heroTextShift = isMobile ? -40 : -80;
        const archScale = isMobile ? 1.45 : 2.05;
        const interiorScale = isMobile ? 1.14 : 1.32;
        const aboutLift = isMobile ? 28 : 56;

        const heroWords = gsap.utils.toArray<HTMLElement>(".hero-word");
        const aboutWords = gsap.utils.toArray<HTMLElement>(".about-word");
        const latestCards = gsap.utils.toArray<HTMLElement>(".latest-card");
        const latestTabs = gsap.utils.toArray<HTMLElement>(".latest-tab");
        const aboutPanels = aboutImagesRef.current
          ? Array.from(aboutImagesRef.current.querySelectorAll<HTMLElement>("[data-about-panel]"))
          : [];

        const playAboutReveal = () => {
          if (aboutEnteredRef.current) return;
          aboutEnteredRef.current = true;

          if (aboutLabelRef.current) {
            animate(aboutLabelRef.current, {
              opacity: [0, 1],
              translateY: [titleTranslate, 0],
              duration: 600,
              ease: "outExpo",
            });
          }

          animate(aboutWords, {
            opacity: [0, 1],
            translateY: [titleTranslate, 0],
            delay: stagger(100, { start: 120 }),
            duration: 700,
            ease: "outExpo",
          });

          if (aboutBodyRef.current) {
            animate(aboutBodyRef.current, {
              opacity: [0, 1],
              translateY: [titleTranslate, 0],
              delay: 480,
              duration: 650,
              ease: "outExpo",
            });
          }

          animate(aboutPanels, {
            opacity: [0, 1],
            scale: [0.95, 1],
            translateY: [titleTranslate, 0],
            delay: stagger(150, { start: 420 }),
            duration: 700,
            ease: "outExpo",
          });
        };

        gsap.set([heroLabelRef.current, heroSubtitleRef.current, heroCtaRef.current], {
          opacity: 0,
          y: translateUnit,
        });
        gsap.set(heroWords, { opacity: 0, y: translateUnit * 2 });
        gsap.set([aboutLabelRef.current, aboutBodyRef.current, latestTitleRef.current, latestLinkRef.current], {
          opacity: 0,
          y: titleTranslate,
        });
        gsap.set(aboutWords, { opacity: 0, y: titleTranslate });
        gsap.set(aboutPanels, { opacity: 0, scale: 0.95, y: titleTranslate });
        gsap.set(latestTabs, { opacity: 0, scale: 0.8 });
        gsap.set(latestCards, { opacity: 0, y: translateUnit + 10 });
        gsap.set(aboutContentRef.current, {
          opacity: 0.14,
          y: aboutLift,
          scale: isMobile ? 0.99 : 0.975,
        });
        gsap.set(aboutSectionRef.current, {
          y: isMobile ? 36 : 64,
        });
        gsap.set(aboutBackgroundRef.current, {
          scale: isMobile ? 1.03 : 1.08,
          opacity: 0.92,
        });

        if (heroLabelRef.current) {
          animate(heroLabelRef.current, {
            opacity: [0, 0.7],
            translateY: [translateUnit, 0],
            duration: 600,
            ease: "outExpo",
          });
        }

        animate(heroWords, {
          opacity: [0, 1],
          translateY: [translateUnit * 2, 0],
          delay: stagger(120, { start: 140 }),
          duration: 900,
          ease: "outExpo",
        });

        if (heroSubtitleRef.current) {
          animate(heroSubtitleRef.current, {
            opacity: [0, 1],
            translateY: [translateUnit, 0],
            delay: 840,
            duration: 600,
            ease: "outExpo",
          });
        }

        if (heroCtaRef.current) {
          animate(heroCtaRef.current, {
            opacity: [0, 1],
            scale: [0.95, 1],
            delay: 1080,
            duration: 650,
            ease: "outExpo",
          });
        }

        gsap.timeline({
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end: isMobile ? "+=135%" : "+=185%",
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (self.progress >= 0.62) {
                playAboutReveal();
              }
            },
          },
        })
          .to(
            heroPortalRef.current,
            {
              scale: isMobile ? 1.22 : 1.34,
              opacity: 1,
              ease: "none",
            },
            0,
          )
          .to(
            heroArchRef.current,
            {
              scale: archScale,
              transformOrigin: "center center",
              opacity: 0.22,
              filter: "blur(6px)",
              ease: "none",
            },
            0,
          )
          .to(
            heroInteriorRef.current,
            {
              scale: interiorScale,
              transformOrigin: "center center",
              filter: "brightness(1.04)",
              ease: "none",
            },
            0,
          )
          .to(
            heroShadeRef.current,
            {
              opacity: 0.82,
              ease: "none",
            },
            0,
          )
          .to(
            heroMistRef.current,
            {
              opacity: 0.92,
              scale: isMobile ? 1.08 : 1.16,
              ease: "none",
            },
            0,
          )
          .to(
            heroTextRef.current,
            {
              y: heroTextShift,
              opacity: 0,
              ease: "none",
              duration: 0.3,
            },
            0,
          )
          .to(
            aboutSectionRef.current,
            {
              y: 0,
              ease: "none",
              duration: 0.42,
            },
            0.48,
          )
          .to(
            aboutBackgroundRef.current,
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              duration: 0.42,
            },
            0.48,
          )
          .to(
            aboutContentRef.current,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              ease: "none",
              duration: 0.38,
            },
            0.58,
          )
          .to(
            [heroInteriorRef.current, heroPortalRef.current, heroMistRef.current],
            {
              opacity: 0,
              ease: "none",
              duration: 0.35,
            },
            0.58,
          )
          .to(
            [heroArchRef.current, heroShadeRef.current],
            {
              opacity: 0,
              ease: "none",
              duration: 0.26,
            },
            0.72,
          );

        gsap.to(aboutBackgroundRef.current, {
          yPercent: isMobile ? 5 : 10,
          ease: "none",
          scrollTrigger: {
            trigger: aboutSectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });

        gsap.fromTo(
          aboutSectionRef.current,
          {
            y: isMobile ? 8 : 12,
          },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: "top 72%",
              end: "top top",
              scrub: 1.1,
            },
          },
        );

        ScrollTrigger.create({
          trigger: aboutSectionRef.current,
          start: "top 85%",
          once: true,
          onEnter: playAboutReveal,
        });

        gsap.fromTo(
          latestBackgroundRef.current,
          { scale: isMobile ? 1.04 : 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: latestSectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.3,
            },
          },
        );

        ScrollTrigger.create({
          trigger: latestSectionRef.current,
          start: "top 72%",
          once: true,
          onEnter: () => {
            latestEnteredRef.current = true;

            if (latestTitleRef.current) {
              animate(latestTitleRef.current, {
                opacity: [0, 1],
                translateY: [titleTranslate, 0],
                duration: 700,
                ease: "outExpo",
              });
            }

            animate(latestTabs, {
              opacity: [0, 1],
              scale: [0.8, 1],
              delay: stagger(80, { start: 160 }),
              duration: 550,
              ease: "outBack",
            });

            animate(latestCards, {
              opacity: [0, 1],
              translateY: [translateUnit + 10, 0],
              delay: stagger(150, { start: 420 }),
              duration: 700,
              ease: "outExpo",
            });

            if (latestLinkRef.current) {
              animate(latestLinkRef.current, {
                opacity: [0, 1],
                translateY: [titleTranslate, 0],
                delay: 820,
                duration: 600,
                ease: "outExpo",
              });
            }
          },
        });
      };

      mm.add("(max-width: 767px)", () => {
        setupSceneAnimations(true);
      });

      mm.add("(min-width: 768px)", () => {
        setupSceneAnimations(false);
      });

      return () => mm.revert();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!latestEnteredRef.current) return;

    const cards = latestCardsRef.current
      ? Array.from(latestCardsRef.current.querySelectorAll<HTMLElement>(".latest-card"))
      : [];

    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 36 });

    animate(cards, {
      opacity: [0, 1],
      translateY: [36, 0],
      delay: stagger(150),
      duration: 650,
      ease: "outExpo",
    });
  }, [activeFilter, filteredProperties]);

  return (
    <div ref={rootRef} className="relative overflow-x-clip bg-[var(--home-ink)] text-[var(--home-cream)]">
      <section
        ref={heroSectionRef}
        className="relative h-screen overflow-hidden isolate"
        aria-label="Hero immobilier de luxe"
      >
        <div
          ref={heroInteriorRef}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage:
              "linear-gradient(rgba(18, 15, 12, 0.18), rgba(18, 15, 12, 0.1)), url('/interior-entrance.jpg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            ref={heroPortalRef}
            className="will-change-transform"
            style={{
              width: "min(54vw, 680px)",
              height: "min(72vh, 760px)",
              opacity: 0.92,
              backgroundImage:
                "linear-gradient(rgba(18, 15, 12, 0.02), rgba(18, 15, 12, 0.1)), url('/interior-entrance.jpg')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              clipPath:
                "polygon(18% 100%, 14% 72%, 16% 41%, 25% 15%, 38% 4%, 50% 0%, 62% 4%, 75% 15%, 84% 41%, 86% 72%, 82% 100%)",
              filter: "saturate(1.02) contrast(1.02)",
              boxShadow: "0 0 80px rgba(245, 240, 232, 0.1)",
            }}
          />
        </div>
        <div
          ref={heroArchRef}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: "url('/Background.webp')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            mixBlendMode: "normal",
          }}
        />

        <div
          ref={heroShadeRef}
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: 0.38,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.58) 100%)",
          }}
        />
        <div
          ref={heroMistRef}
          className="absolute inset-x-0 bottom-[-18vh] h-[52vh] will-change-transform"
          style={{
            opacity: 0.22,
            background:
              "radial-gradient(ellipse at center, rgba(245,240,232,0.26) 0%, rgba(245,240,232,0.08) 34%, rgba(245,240,232,0) 70%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-b from-transparent via-[#171310]/55 to-[#171310]" />
        <div className="pointer-events-none absolute bottom-6 right-6 z-10 md:bottom-10 md:right-12">
          <div className="">
            <Image
              src="/say-stamp.png"
              alt="Say Home stamp"
              width={125}
              height={125}
              className="h-[125px] w-[125px] object-contain opacity-88 md:h-[112px] md:w-[112px]"
              sizes="(max-width: 767px) 68px, 94px"
            />
          </div>
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 mx-auto flex h-[93%] w-full max-w-[1400px] flex-col items-start justify-end px-8 pb-28 text-left will-change-transform md:px-16 md:pb-36"
        >


          <h1
            ref={heroLabelRef}

            className="max-w-[620px] text-[40px] leading-[0.92] font-semibold tracking-[-0.03em] md:text-[72px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {splitHeadline(HERO_HEADLINE)}
          </h1>

          <p
            ref={heroSubtitleRef}
            className="mt-4 max-w-[430px] text-base leading-[1.7] text-[var(--home-cream)]/82"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Des villas, appartements et riads choisis pour leur lumiere, leur rythme et leur facon
            unique d'habiter Marrakech.
          </p>

          <div ref={heroCtaRef} className="mt-4 will-change-transform">
            <Link
              href="/properties"
              className="inline-flex items-center rounded-[1px] bg-[#2C1A0E] px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.03]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Explorer les offres
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={aboutSectionRef}
        id="about"
        className="relative z-10 -mt-[100vh] flex min-h-screen items-center overflow-hidden px-6 pb-24 pt-[28vh] md:px-10 md:pt-[30vh]"
      >
        <div
          ref={aboutBackgroundRef}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('/interior-entrance.jpg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[20vh] bg-gradient-to-b from-[#171310] via-[#171310]/75 to-transparent" />

        <div
          ref={aboutContentRef}
          className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 will-change-transform md:grid-cols-[1.1fr_0.9fr] md:items-center"
        >
          <div className="max-w-2xl">
            <p
              ref={aboutLabelRef}
              className="mb-5 text-[11px] uppercase tracking-[0.15em] text-[var(--home-cream)]/70 md:text-[13px]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              A PROPOS
            </p>

            <h2
              className="max-w-xl text-[38px] leading-[1] font-semibold tracking-[-0.03em] md:text-[64px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {"Une adresse, une emotion, une maniere plus sensible de chercher.".split(" ").map(
                (word, index, array) => (
                  <span
                    key={`${word}-${index}`}
                    className="about-word inline-block will-change-transform"
                    style={{ opacity: 0, transform: "translateY(30px)" }}
                  >
                    {word}
                    {index < array.length - 1 ? "\u00A0" : ""}
                  </span>
                ),
              )}
            </h2>

            <div
              ref={aboutBodyRef}
              className="mt-6 space-y-4 text-base leading-[1.7] text-[var(--home-cream)]/82"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <p>
                SAY Home compose des parcours immobiliers plus fluides, plus inspires et plus
                exigeants, du premier echange jusqu'a la visite qui fait vraiment sens.
              </p>
              <p>
                Nous travaillons les volumes, la lumiere et les quartiers comme un art de vivre,
                avec une approche claire, humaine et resolument contemporaine.
              </p>
            </div>
          </div>

          <div ref={aboutImagesRef} className="grid gap-5 md:justify-self-end">
            <div
              data-about-panel
              className="overflow-hidden rounded-[24px] border border-white/12 bg-white/6 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm will-change-transform"
            >
              <div className="relative h-[220px] overflow-hidden rounded-[18px]">
                <Image
                  src="/salon.png"
                  alt="Salon lumineux"
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 100vw, 28vw"
                />
              </div>
            </div>

            <div
              data-about-panel
              className="overflow-hidden rounded-[24px] border border-white/12 bg-white/6 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm will-change-transform md:translate-x-10"
            >
              <div className="relative h-[220px] overflow-hidden rounded-[18px]">
                <Image
                  src="/cuisine.png"
                  alt="Salle a manger de standing"
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 100vw, 28vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={latestSectionRef}
        className="relative min-h-screen overflow-hidden px-6 py-24 md:px-10"
      >
        <div
          ref={latestBackgroundRef}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('/last-scene.jpg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div ref={latestTitleRef} className="max-w-2xl will-change-transform">
            <p
              className="mb-5 text-[11px] uppercase tracking-[0.15em] text-[var(--home-cream)]/70 md:text-[13px]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Dernieres proprietes
            </p>
            <h2
              className="text-[38px] leading-[1] font-semibold tracking-[-0.03em] md:text-[62px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Latest Properties
            </h2>
            <p
              className="mt-5 max-w-xl text-base leading-[1.7] text-[var(--home-cream)]/82"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Une selection recente filtree par usage et par rythme de vie, avec des animations
              plus douces que demonstratives.
            </p>
          </div>

          <div ref={latestTabsRef} className="mt-10 flex flex-wrap gap-3">
            {FILTERS.map((filter) => {
              const isActive = filter.key === activeFilter;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className="latest-tab rounded-full border px-4 py-2 text-xs uppercase tracking-[0.15em] transition duration-300 will-change-transform"
                  style={{
                    fontFamily: "var(--font-body)",
                    borderColor: isActive ? "#2C1A0E" : "rgba(245, 240, 232, 0.28)",
                    backgroundColor: isActive ? "#2C1A0E" : "rgba(255, 255, 255, 0.08)",
                    color: isActive ? "#ffffff" : "var(--home-cream)",
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div
            ref={latestCardsRef}
            className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="latest-card min-h-[420px] animate-pulse rounded-[16px] border border-white/10 bg-white/10 backdrop-blur-sm"
                  />
                ))
              : filteredProperties.map((property) => (
                  <article
                    key={property.id}
                    className="latest-card group overflow-hidden rounded-[16px] border border-white/12 bg-[rgba(255,255,255,0.10)] shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_64px_rgba(0,0,0,0.35)] will-change-transform"
                  >
                    <div className="relative h-[235px] overflow-hidden">
                      <Image
                        src={property.medias?.[0] || "/placeholder.jpg"}
                        alt={property.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      />
                    </div>

                    <div className="flex min-h-[190px] flex-col justify-between p-5">
                      <div>
                        <div
                          className="flex items-center gap-2 text-[13px] text-[var(--home-cream)]/72"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          <MapPin className="h-4 w-4" strokeWidth={1.7} />
                          <span>{SECTEUR_LABELS[property.secteur ?? ""] ?? property.secteur ?? "Marrakech"}</span>
                        </div>

                        <h3
                          className="mt-3 text-[18px] font-semibold text-[var(--home-cream)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {property.title}
                        </h3>

                        <p
                          className="mt-2 text-sm text-[var(--home-cream)]/68"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {TYPE_LABELS[property.type ?? ""] ?? "Residence"} dans un quartier soigneusement
                          selectionne.
                        </p>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {[formatPrice(property.price, property.offerType), formatSurface(property.surface), formatRooms(property.rooms)].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/14 bg-black/18 px-3 py-1 text-[12px] text-[var(--home-cream)]/88"
                                style={{ fontFamily: "var(--font-body)" }}
                              >
                                {tag}
                              </span>
                            ),
                          )}
                        </div>

                        <Link
                          href={`/properties/${property.id}`}
                          className="shrink-0 text-sm text-[var(--home-cream)] transition hover:text-white"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
          </div>

          <div ref={latestLinkRef} className="mt-10 will-change-transform">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-sm text-[var(--home-cream)]/86 transition hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Voir plus d'offres →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
