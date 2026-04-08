import Image from 'next/image';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from 'react-icons/fa';

export default function ContactSection() {
  return (
    <div id="contact">
      <div className="w-full h-6 bg-white" />
      <section className="flex flex-row w-full" style={{ height: 'clamp(320px, 40vw, 480px)' }}>
        <div className="w-1/2 bg-[#1a1a1a] flex flex-col justify-center" style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}>
          <h2 className="font-serif font-bold text-white mb-8" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)' }}>Contactez-Nous</h2>
          <form className="flex flex-col gap-6 w-[90%]">
            <div className="border-b border-gray-600">
              <input type="text" placeholder="Nom"
                className="w-full bg-transparent text-white placeholder-gray-400 py-1.5 outline-none" style={{ fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)' }} />
            </div>
            <div className="border-b border-gray-600">
              <input type="email" placeholder="Email"
                className="w-full bg-transparent text-white placeholder-gray-400 py-1.5 outline-none" style={{ fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)' }} />
            </div>
            <div className="border-b border-gray-600">
              <input type="text" placeholder="Message"
                className="w-full bg-transparent text-white placeholder-gray-400 outline-none" style={{ fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)', paddingBottom: 'clamp(1rem, 3vw, 2rem)' }} />
            </div>
            <button className="w-fit text-white border border-white font-medium hover:bg-[#2C1A0E] hover:border-transparent transition rounded-[1px]"
              style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)', padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 20px)' }}>
              Envoyez
            </button>
          </form>
        </div>
        <div className="w-1/2 bg-[#1a1a1a] flex items-center justify-center">
          <div className="bg-white h-[90%] mt-[5%]" style={{ width: 'clamp(280px, 35vw, 580px)', padding: 'clamp(0.75rem, 1.5vw, 1.5rem)' }}>
            <div className="relative w-full mb-3" style={{ height: '75%' }}>
              <Image src="/chambre.png" alt="Chambre" fill sizes="35vw" className="object-cover object-center" />
            </div>
            <div className="flex flex-col gap-1.5 text-gray-700 mb-3" style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}>
              <div className="flex items-center gap-1.5"><MapPin size={10} /><span>Marrakech, Maroc</span></div>
              <div className="flex items-center gap-1.5"><Phone size={10} /><span>0887654321</span></div>
              <div className="flex items-center gap-1.5"><Mail size={10} /><span>541HOME@gmail.com</span></div>
            </div>
            <div className="flex gap-3 text-gray-600">
              <FaInstagram size={11} className="cursor-pointer hover:text-black" />
              <FaTwitter size={11} className="cursor-pointer hover:text-black" />
              <FaFacebookF size={11} className="cursor-pointer hover:text-black" />
              <FaYoutube size={11} className="cursor-pointer hover:text-black" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}