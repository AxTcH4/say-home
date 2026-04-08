import Image from 'next/image';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from 'react-icons/fa';

export default function ContactSection() {
  return (
    <div id="contact">
      {/* Bande blanche de séparation */}
      <div className="w-full h-6 bg-white" />

      <section className="flex w-full" style={{ height: '480px' }}>
        {/* Left - formulaire fond noir */}
        <div className="w-1/2 bg-[#1a1a1a] px-12 py-8 flex flex-col justify-center">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">Contactez-Nous</h2>
          <form className="flex flex-col gap-4 w-[70%]">
            <div className="border-b border-gray-600">
              <input type="text" placeholder="Nom"
                className="w-full bg-transparent text-white text-xs placeholder-gray-400 py-1.5 outline-none" />
            </div>
            <div className="border-b border-gray-600">
              <input type="email" placeholder="Email"
                className="w-full bg-transparent text-white text-xs placeholder-gray-400 py-1.5 outline-none" />
            </div>
            <div className="border-b border-gray-600">
              <input type="text" placeholder="Message"
                className="w-full bg-transparent text-white text-xs placeholder-gray-400 py-1.5 outline-none" />
            </div>
            <div className="border-b border-gray-600 py-2" />
            <button className="w-fit px-6 py-2 bg-[#2C1A0E] text-white text-xs hover:opacity-90 transition mt-1">
              Envoyez
            </button>
          </form>
        </div>

        {/* Right - fond noir avec card blanche centrée */}
        <div className="w-1/2 bg-[#1a1a1a] flex items-center justify-center">
          <div className="bg-white p-6" style={{ width: '580px' }}>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit
              interdum, ac aliquet odio mattis.
            </p>

            {/* Image taille fixe */}
            <div className="relative w-full mb-3" style={{ height: '180px' }}>
              <Image
                src="/chambre.png"
                alt="Chambre"
                fill
                sizes="300px"
                className="object-cover object-center"
              />
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-1.5 text-xs text-gray-700 mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin size={10} />
                <span>Marrakech, Maroc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={10} />
                <span>0887654321</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={10} />
                <span>541HOME@gmail.com</span>
              </div>
            </div>

            {/* Social icons */}
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