'use client';
import { useEffect, useState } from 'react';

const images = ['/villa1.png', '/villa2.png', '/villa3.png'];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {images.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === current ? 1 : 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        
        <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">
          Trouvez le lieu qui vous <br /> inspire
        </h1>
        <button className="px-6 py-2 bg-[#2C1A0E] text-white text-sm rounded-sm hover:opacity-90 transition">
          Explore more
        </button>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === current ? 'bg-white w-4' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white animate-bounce">
          ↓
        </div>
      </div>
    </section>
  );
}