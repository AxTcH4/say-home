'use client';
import { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import Link from 'next/link';
import { getLatestProperties } from '@/lib/api';

const filters = ['Villas à vendre', 'Villas à louer', 'Appartements à vendre', 'Appartements à louer', 'Riads à vendre', 'Riads à louer'];



export default function LatestProperties() {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const result = await getLatestProperties();
        
        if (result.data === null || result.data.length === 0) {
          setProperties([]);
        } else {
          setProperties(result.data.map((p: any) => ({
          id: p.id,
          description: p.description || 'Location',
          medias: p.medias,
          secteur: p.secteur,
          title: p.title,
          price: `${p.price} MAD`,
          surface: p.surface ? `${p.surface} M2` : 'N/A',
          rooms: p.rooms ? `${p.rooms} chambre(s)` : 'N/A', 
          })));
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <section style={{ padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2.5rem)' }} className="bg-white">
      <h2 className="text-center font-serif font-bold mb-6 leading-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
        Récements Ajoutées
      </h2>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }}
            className={`px-5 py-2 rounded-full font-medium border transition ${
              activeFilter === filter ? 'bg-[#2C1A0E] text-white border-[#2C1A0E]' : 'bg-white text-gray-800 border-gray-800 hover:bg-gray-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {properties.map((property: any) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
      <div className="text-right max-w-6xl mx-auto mt-6">
        <Link href="/properties" style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }} className="text-gray-600 hover:underline">
          Voir plus d'offres ›
        </Link>
      </div>
    </section>
  );
}