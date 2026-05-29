"use client";

import { useEffect, useState } from "react";

const images = ["/villa1.png", "/villa2.png", "/villa3.png"];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative top-0 h-[92vh] w-full overflow-hidden transition-all duration-700 ease-out">
      {images.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: index === current ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white transition-all duration-700 delay-150">
        <h1
          className="mb-6 font-serif font-bold leading-tight"
          style={{ fontSize: "clamp(2rem, 3vw, 5rem)" }}
        >
          Trouvez le lieu qui vous <br /> inspire
        </h1>
        <button
          className="rounded-[1px] bg-[#2C1A0E] text-white transition duration-700 delay-300 hover:scale-105 hover:border-2 hover:bg-transparent"
          style={{
            fontSize: "clamp(0.75rem, 1.5vw, 1.125rem)",
            padding: "clamp(8px, 1.2vw, 12px) clamp(16px, 2.5vw, 24px)",
            marginTop: "clamp(16px, 2vw, 24px)",
          }}
        >
          Explore more
        </button>
      </div>
      <div className="absolute bottom-16 left-1/2 z-10 mb-3 flex -translate-x-1/2 gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${index === current ? "w-4 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white animate-bounce">
          ↓
        </div>
      </div>
    </section>
  );
}
