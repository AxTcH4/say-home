'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 bg-white shadow-sm">
      {/* Logo SAY HOME */}
      <Link href="/" className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 3L2 13H5V24H11V17H17V24H23V13H26L14 3Z" fill="#2C1A0E"/>
          <rect x="11" y="17" width="6" height="7" fill="#2C1A0E"/>
        </svg>
        <span className="text-lg font-bold tracking-widest text-[#2C1A0E]">SAY HOME</span>
      </Link>

      {/* Links - parfaitement centrés */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-sm font-medium text-gray-700">
        <Link href="/" className="hover:text-black transition">Accueil</Link>
        <Link href="/properties" className="hover:text-black transition">Services</Link>
        <Link href="/#about" className="hover:text-black transition">À propos</Link>
        <Link href="/#contact" className="hover:text-black transition">Contact</Link>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <Link href="#" className="px-5 py-2 text-sm border border-black rounded-sm hover:bg-gray-100 transition">
          Se connecter
        </Link>
        <Link href="#" className="px-5 py-2 text-sm bg-[#2C1A0E] text-white rounded-sm hover:opacity-90 transition">
          S'inscrire
        </Link>
      </div>
    </nav>
  );
}