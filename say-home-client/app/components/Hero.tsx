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
    <section className="relative top-0 w-full h-[92vh] overflow-hidden">
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
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="font-serif font-bold mb-6 leading-tight" style={{ fontSize: 'clamp(2rem, 3vw, 5rem)' }}>
          Trouvez le lieu qui vous <br /> inspire
        </h1>
        <button className="bg-[#2C1A0E] text-white hover:scale-105 hover:border-2 hover:bg-transparent transition rounded-[1px]"
          style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1.125rem)', padding: 'clamp(8px, 1.2vw, 12px) clamp(16px, 2.5vw, 24px)', marginTop: 'clamp(16px, 2vw, 24px)' }}>
          Explore more
        </button>
      </div>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 mb-3">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${index === current ? 'bg-white w-4' : 'bg-white/50 w-2'}`}
          />
        ))}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white animate-bounce">↓</div>
      </div>
    </section>
  );
}