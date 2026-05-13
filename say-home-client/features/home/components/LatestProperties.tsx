'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PropertyCard from '../../properties/components/PropertyCard';
import { getLatestProperties } from '@/shared/lib/api';

const filters = [
  'Villas a vendre',
  'Villas a louer',
  'Appartements a vendre',
  'Appartements a louer',
  'Riads a vendre',
  'Riads a louer',
];

export default function LatestProperties() {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const result = await getLatestProperties();

        if (result.data === null || result.data.length === 0) {
          setProperties([]);
        } else {
          setProperties(
            result.data.map((p: any) => ({
              id: p.id,
              description: p.description || 'Location',
              medias: p.medias,
              type: p.type,
              offerType: p.offerType,
              secteur: p.secteur,
              title: p.title,
              price: `${p.price} MAD${p.offerType === 'RENT' ? ' / mois' : ''}`,
              surface: p.surface ? `${p.surface} M2` : 'N/A',
              rooms: p.rooms ? `${p.rooms} chambre(s)` : 'N/A',
            })),
          );
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property: any) => {
      switch (activeFilter) {
        case 'Villas a vendre':
          return property.type === 'VILLA' && property.offerType === 'SALE';
        case 'Villas a louer':
          return property.type === 'VILLA' && property.offerType === 'RENT';
        case 'Appartements a vendre':
          return property.type === 'APPARTEMENT' && property.offerType === 'SALE';
        case 'Appartements a louer':
          return property.type === 'APPARTEMENT' && property.offerType === 'RENT';
        case 'Riads a vendre':
          return property.type === 'RIAD' && property.offerType === 'SALE';
        case 'Riads a louer':
          return property.type === 'RIAD' && property.offerType === 'RENT';
        default:
          return true;
      }
    });
  }, [activeFilter, properties]);

  return (
    <section style={{ padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2.5rem)' }} className="bg-white">
      <h2
        className="mb-6 text-center font-serif font-bold leading-tight"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
      >
        Recements Ajoutees
      </h2>
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => setActiveFilter(filter)}
            style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }}
            className={`rounded-full border px-5 py-2 font-medium transition ${
              activeFilter === filter
                ? 'border-[#2C1A0E] bg-[#2C1A0E] text-white'
                : 'border-gray-800 bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!loading &&
          filteredProperties.map((property: any) => (
            <PropertyCard key={property.id} {...property} />
          ))}
      </div>
      <div className="mx-auto mt-6 max-w-6xl text-right">
        <Link
          href="/properties"
          style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }}
          className="text-gray-600 hover:underline"
        >
          Voir plus d'offres &rsaquo;
        </Link>
      </div>
    </section>
  );
}
