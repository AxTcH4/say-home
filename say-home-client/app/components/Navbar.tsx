'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function Navbar({ onHero }: { onHero: boolean }) {
  //init the scrolling state 
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.95); // adjust 80 to your hero height
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className={` fixed top-0 left-0 right-0 z-50 flex items-center justify-center ${scrolled ||  !onHero  ? 'bg-white' :'bg-transparent'} `}>
      <nav className={`w-[90%] flex items-center justify-between ${scrolled ||  !onHero ? 'border-b border-black' : 'border-b border-white'}`}>
        {/* Logo SAY HOME */}
        <Link href="/" className="flex items-center gap-2">

          <img src="/logo-w-o-bg.png" alt="SAY Home" className={`w-20 h-20 ${scrolled ||  !onHero  ? 'invert-100' :''}`} />
        </Link>

        {/* Links - parfaitement centrés */}
        <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-sm font-medium text-gray-700`}>
          <Link href="/" className= {`py-7 text-base ${scrolled || !onHero ? 'text-black' :'text-white'} font-medium border-b-4 border-transparent hover:border-[#1a1a1a]    transition  `}>Accueil</Link>
          <Link href="/properties" className= {`py-7 text-base ${scrolled || !onHero ? 'text-black' :'text-white'} font-medium border-b-4 border-transparent hover:border-[#1a1a1a]   transition  `}>Services</Link>
          <Link href="/#about" className= {`py-7 text-base ${scrolled || !onHero ? 'text-black' :'text-white'} font-medium border-b-4 border-transparent hover:border-[#1a1a1a]    transition  `}>À propos</Link>
          <Link href="/#contact" className= {`py-7 text-base ${scrolled || !onHero ? 'text-black' :'text-white'} font-medium border-b-4 border-transparent hover:border-[#1a1a1a]    transition  `}>Contact</Link>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link href="#" className={`-fit px-5 py-2 text-sm ${scrolled || !onHero ? 'text-black border border-black' : 'text-white border border-white'} font-medium hover:bg-[#2C1A0E] hover:border-transparent hover:text-white transition rounded-[1px]`}>
            Se connecter
          </Link>
          <Link href="#" className="w-fit px-6 py-[9px] text-sm bg-[#2C1A0E] text-white  hover:scale-110 transition rounded-[1px]">
            S'inscrire
          </Link>
        </div>
      </nav>
      </div>
    
  );
}