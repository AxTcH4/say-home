"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "../../../shared/components/Navbar";
import PropertyCard from "../../../features/properties/components/PropertyCard";
import { MapPin, Calendar, User } from "lucide-react";
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";
import { getPropertyById } from "@/shared/lib/api";
import Footer from "../../../shared/components/Footer";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id as string);
        if (!data) return;
        setProperty(data.property || null);
        setSimilar(data.similar || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );

  if (!property)
    return (
      <div style={{}} className="w-full h-screen">
        <Navbar onHero={false} />
        <div className="flex flex-col items-center justify-center h-screen ">
          <Image  src="/err-404.png" alt="error 404" width={750} height={50} />

          <p className=" relative mt-[-5vw] text-2xl font-bold text-gray-500">Bien non trouvé</p>
        </div>

        <div />
      </div>
    );

  return (
    <main className="bg-white">
      <Navbar onHero={false} />
      <div className="pt-20 px-10 max-w-7xl mx-auto">
        {/* Galerie */}
        <div className="flex gap-3 mt-6 mb-8">
          <div className="w-1/2 h-80 " 
          style = {{
            backgroundImage: `url(${property.medias?.[0] || '/placeholder.jpg'})`, backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover', backgroundPosition: 'center', }}
          />
          <div className="w-1/2 grid grid-cols-2 gap-3">
            {[1,2,3,4].map((i) => (
            <div
              key={i}
              className="h-[150px]"
              style={{
                backgroundImage: `url(${property.medias?.[i] || '/placeholder.jpg'})`, backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover', backgroundPosition: 'center',
              }}
            />
          ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Contenu principal */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin size={12} />3
                  <span>Marrakech, Maroc</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {property.price} MAD
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="flex flex-row justify-start align-center gap-15 my-6 border-y border-gray-100 py-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl"><Image src="/chambres.svg" width={35} height={35} alt="" /></span>
                <span className="text-xs font-medium">{property.rooms} Chambres</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl"><Image src="/shower.svg" width={30} height={30}  alt="" /></span>
                <span className="text-xs font-medium">4 Salles de bain</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl"><Image src="/surface.svg" width={30} height={30} alt="" /></span>
                <span className="text-xs font-medium">{property.surface} m2</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                Description de la propriété
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                {property.description || "Aucune description disponible."}
              </p>
            </div>

            {/* Équipements */}
            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                Équipements & Caractéristiques
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Climatisation réversible",
                  "Piscine à débordement chauffée",
                  "Système domotique complet",
                  "Cave à vin climatisée",
                  "Salle de sport privée",
                  "Sécurité 24/7 et alarme",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span className="text-gray-400">◎</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Réservation */}
          <div className="w-64 flex-shrink-0">
            <div className="border border-gray-200 rounded p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Réserver une visite
              </h3>
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-xs outline-none text-gray-500"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Votre message
                </label>
                <textarea
                  rows={3}
                  placeholder="Je souhaiterais visiter cette propriété..."
                  className="w-full border border-gray-200 rounded px-3 py-2 text-xs outline-none resize-none text-gray-500 placeholder-gray-400"
                />
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-[#2C1A0E] text-white text-xs py-3 rounded hover:opacity-90 transition mb-4">
                <Calendar size={12} /> Réserver maintenant
              </button>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User size={14} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Agent responsable
                  </p>
                  <p className="text-xs font-semibold text-gray-700">
                    {property.agent
                      ? `${property.agent.firstName} ${property.agent.lastName}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Propriétés similaires */}
        {similar.length > 0 && (
          <div className="mt-4 mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Propriétés similaires
            </h2>
              <div className="grid grid-cols-3 gap-6">
                 {similar.map((item: any, index: number) => (
                    <PropertyCard key={index} {...item} />
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Footer
      <div className="flex w-full">
        <div className="w-1/2 bg-gray-100 px-10 py-8 flex items-center">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3L2 13H5V24H11V17H17V24H23V13H26L14 3Z"
                fill="#2C1A0E"
              />
            </svg>
            <span className="text-lg font-bold tracking-widest text-[#2C1A0E]">
              SAY HOME
            </span>
          </div>
        </div>
        <div className="w-1/2 bg-[#1a1a1a] px-10 py-8 flex items-center justify-center">
          <div className="border border-gray-700 p-6 w-[60%]">
            <div className="flex flex-col gap-2 text-xs text-gray-300 mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={10} /> Marrakech, Maroc
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span> 0687654321
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span> sayhome.app@gmail.com
              </div>
            </div>
            <div className="flex gap-3 text-gray-400">
              <FaInstagram
                size={12}
                className="cursor-pointer hover:text-white"
              />
              <FaTwitter
                size={12}
                className="cursor-pointer hover:text-white"
              />
              <FaFacebookF
                size={12}
                className="cursor-pointer hover:text-white"
              />
              <FaYoutube
                size={12}
                className="cursor-pointer hover:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-10 py-4 bg-[#1a1a1a] border-t border-gray-700">
        <div className="text-white font-bold text-lg">SAY HOME</div>
        <div className="flex gap-6 text-xs text-gray-400">
          <a href="#" className="hover:text-white">
            À propos
          </a>
          <a href="#" className="hover:text-white">
            Services
          </a>
          <a href="#" className="hover:text-white">
            Contact
          </a>
        </div> 
      </div>*/}
        <Footer />

    </main>
  );
}
