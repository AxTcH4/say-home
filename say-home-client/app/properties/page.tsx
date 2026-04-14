'use client';
import { useState, useEffect, useRef, use } from 'react';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { Search } from 'lucide-react';
import { getAllProperties, searchProperties } from '../../lib/api';
import { set, z } from "zod";
import { redirect } from 'next/navigation'

const searchSchema = z.object({
    title: z.string().optional(),
    type: z.string().optional(),
    secteur: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    });


const placeholders = [
  { id: 1, location: 'Location', title: "Titre de l'offre bibliablalba", price: '10000000 MAD', surface: '5000 M²', rooms: '50' },
  { id: 2, location: 'Location', title: "Titre de l'offre bibliablalba", price: '40000000 MAD', surface: '5000 M²', rooms: '60' },
  { id: 3, location: 'Location', title: "Titre de l'offre bibliablalba", price: '60000000 MAD', surface: '5000 M²', rooms: '60' },
  { id: 4, location: 'Location', title: "Titre de l'offre bibliablalba", price: '10000000 MAD', surface: '5000 M²', rooms: '90' },
  { id: 5, location: 'Location', title: "Titre de l'offre bibliablalba", price: '40000000 MAD', surface: '5000 M²', rooms: '30' },
  { id: 6, location: 'Location', title: "Titre de l'offre bibliablalba", price: '60000000 MAD', surface: '5000 M²', rooms: '50' },
  { id: 7, location: 'Location', title: "Titre de l'offre bibliablalba", price: '10000000 MAD', surface: '5000 M²', rooms: '93' },
  { id: 8, location: 'Location', title: "Titre de l'offre bibliablalba", price: '40000000 MAD', surface: '5000 M²', rooms: '40' },
  { id: 9, location: 'Location', title: "Titre de l'offre bibliablalba", price: '60000000 MAD', surface: '5000 M²', rooms: '50' },
];

export default function PropertiesPage() {
  const [items, setItems] = useState<any[]>(placeholders);
  const [loading, setLoading] = useState(true);
  const typeRef = useRef<HTMLSelectElement>(null);
  const secteurRef = useRef<HTMLSelectElement>(null);
  const minPriceRef = useRef<HTMLInputElement>(null);
  const maxPriceRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  // const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<"404" | "400" | "500" | null>(null);
  useEffect(() => {
    console.log('New items:' + items);
  }, [items]);
  
  useEffect(() => {
    console.log('New error:' + error);
  },[error])
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await getAllProperties();
      if (data && data.length > 0) {
        setItems(data.map((p: any) => ({
          id: p.id,
          location: p.description || 'Location',
          title: p.title,
          price: `${p.price} MAD`,
          surface: 'N/A',
          rooms: 'N/A',
        })));
      } else {
        setItems(placeholders);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setItems(placeholders);
    } finally {
      setLoading(false);
    }
  };



  const searchContent = async (e: any) => {
      e.preventDefault();
      //clean inputs
      const data = searchSchema.parse({ 
        title: titleRef.current?.value.trim(),
        type: typeRef.current?.value.trim(),
        secteur: secteurRef.current?.value.trim(),
        minPrice: minPriceRef.current?.value ||0,
        maxPrice: maxPriceRef.current?.value ||0,
      });
      
      try {
          const result = await searchProperties(data);
          console.log(result);

        if (result.status === 404) {
          console.log("In 404 condition");
          setItems([]);
          setError("404");
          }
        else if (!result || result.status === 500) {
          setItems([]);
          setError("500");
        }
        else if (result.status === 400) {
          setItems([]);
          setError("400");
        }
        else {

        setItems(result.data.map((item: any) => ({
          id: item.property.id,
          main_pic: item.property.main_pic || '/placeholder.jpg',
          secteur: item.property.secteur || 'Location',
          title: item.property.title,
          price: `${item.property.price} MAD`,
          surface: item.property.surface || 'N/A',
          rooms: item.property.rooms || 'N/A',
          score: item.score
        })));
        setError(null); // clear any previous error
      }

        } catch (error: any) {      
              setItems([]);
              setError("500");
              console.error(error);
        }
  };
  
  return (
    <main>
      <Navbar onHero={false} />
      <div className="pt-25 px-8 pb-10 flex gap-6 min-h-screen bg-white">
        <form className="w-[18vw] pe-3 flex-shrink-0 pt-4" onSubmit={searchContent} method="get">
          
          {/* //title */}
          <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 mb-4 gap-2">
            <Search size={12} className="text-gray-400" />
            <input ref = {titleRef} type="text" placeholder="Que cherchez-vous?"
              className="text-xs outline-none w-full placeholder-gray-400"/>
          </div>

          {/* //Type */}
          <p className="text-xs font-semibold text-gray-700 mb-1">Type</p>
          <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 mb-4 gap-2">
            <select className="text-xs outline-none w-full text-gray-400 bg-white" ref ={typeRef}>
              <option value="" >Sélectionnez un type</option>
              <option value="villa">Villa</option>
              <option value="appartement">Appartement</option>
              <option value="riad">Riad</option>
            </select>
          </div>

          {/* //secteur */}
          <p className="text-xs font-semibold text-gray-700 mb-1">Secteur</p>
          <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 mb-4 gap-2">
            <select ref = {secteurRef} className="text-xs outline-none w-full text-gray-400 bg-white">
              <option value="">Sélectionnez un Secteur</option>
              <option value="gueliz">Guéliz</option>
              <option value="hivernage">Hivernage</option>
              <option value="medina">Médina</option>
            </select>
          </div>

          {/* //prix */}
          <p className="text-xs font-semibold text-gray-700 mb-1">Prix</p>
          <div className="flex gap-2 mb-6">
            <input type="number" placeholder="min" ref={minPriceRef}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none" />
            <input type="number" placeholder="max" ref={maxPriceRef}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none" />
          </div>

          {/* //boutton */}
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#2C1A0E] text-white text-xs py-2 rounded hover:opacity-90 transition">
            Rechercher <Search size={12} />
          </button>
        </form>

        <div className="flex-1 pt-4">
          { 
            error === "400" ?
            <div className="flex flex-col justify-center ">
              <span></span>
              <p className=" relative text-2xl font-bold text-gray-500">Bad Request</p>

            </div>
            
              :
            error === "404" ? <div className="flex flex-col justify-center ">
            <p className="text-sm font-medium text-gray-700">
            Résultats: <span className="font-bold">0 propriétés</span>
            </p>
               <div className="flex flex-col items-center justify-center mt-7 ">
                 <Image  src="/err-404.png" alt="error 404" width={450} height={50} />
       
                 <p className=" relative mt-[-3.5vw] text-2xl font-bold text-gray-500 ">Aucun Bien trouvé</p>
               </div>

            </div>
            
            :
            error === "500" ?
            <div className="">
              <span></span>

              <p className=" relative text-2xl font-bold text-gray-500">Une Erreur Interne est survenue</p>
            </div>
            :
     

           <>
            <div className="flex items-center justify-between mb-4">
                   <p className="text-sm font-medium text-gray-700">
                   Résultats: <span className="font-bold">{items.length} propriétés</span>
                   </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 {items.map((item: any, index: number) => (
                    <PropertyCard key={index} {...item} />
               ))}
             </div>
            </>
}
        </div>
      </div>
      <Footer />
    </main>
  );
}