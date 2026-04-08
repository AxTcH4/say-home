export default function Footer() {
  return (
    <footer className="flex items-center justify-between bg-[#1a1a1a] text-white"
      style={{ padding: 'clamp(1rem, 2vw, 1.5rem) clamp(1.5rem, 4vw, 2.5rem)' }}>
      <div className="flex items-center gap-2">
        <img src="/logo-w-o-bg.png" alt="SAY Home" style={{ width: 'clamp(3rem, 5vw, 5rem)', height: 'clamp(3rem, 5vw, 5rem)' }} />
      </div>
      <div className="flex gap-8 text-gray-400" style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }}>
        <a href="#" className="hover:text-white transition">À propos</a>
        <a href="#" className="hover:text-white transition">Services</a>
        <a href="#" className="hover:text-white transition">Contact</a>
      </div>
    </footer>
  );
}