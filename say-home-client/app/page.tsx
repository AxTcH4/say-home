"use client";
import ChatBubble from "../features/chatbot/components/chatbotBubble";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../shared/components/Navbar";
import Footer from "../shared/components/Footer";
import CinematicHome from "../features/home/components/CinematicHome";
import { useAuth } from "@/features/auth/hooks/useAuth";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const footerWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!footerWrapRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerWrapRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerWrapRef.current,
            start: "top 92%",
            once: true,
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <main>
      <Navbar onHero={true} />
      <CinematicHome />
      {isAuthenticated && !isLoading ? <ChatBubble /> : null}
      <div ref={footerWrapRef}>
        <Footer />
      </div>
    </main>
  );
}
