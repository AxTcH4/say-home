export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-10 py-6 bg-[#1a1a1a] text-white">
      {/* Logo SAY HOME */}
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 3L2 13H5V24H11V17H17V24H23V13H26L14 3Z" fill="#2C1A0E"/>
          <rect x="11" y="17" width="6" height="7" fill="#2C1A0E"/>
        </svg>
        <span className="text-lg font-bold tracking-widest text-white">SAY HOME</span>
      </div>

      <div className="flex gap-8 text-sm text-gray-400">
        <a href="#" className="hover:text-white transition">À propos</a>
        <a href="#" className="hover:text-white transition">Services</a>
        <a href="#" className="hover:text-white transition">Contact</a>
      </div>
    </footer>
  );
}