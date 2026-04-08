'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { Search } from 'lucide-react';
import { getAllProperties } from '../../lib/api';

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
  const [properties, setProperties] = useState<any[]>(placeholders);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await getAllProperties({ minPrice, maxPrice });
      if (data && data.length > 0) {
        setProperties(data.map((p: any) => ({
          id: p.id,
          location: p.description || 'Location',
          title: p.title,
          price: `${p.price} MAD`,
          surface: 'N/A',
          rooms: 'N/A',
        })));
      } else {
        setProperties(placeholders);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setProperties(placeholders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <main>
      <Navbar onHero={false} />
      <div className="pt-25 px-8 pb-10 flex gap-6 min-h-screen bg-white">
        <div className="w-[18vw] pe-3 flex-shrink-0 pt-4">
          <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 mb-4 gap-2">
            <Search size={12} className="text-gray-400" />
            <input type="text" placeholder="Que cherchez-vous?"
              className="text-xs outline-none w-full placeholder-gray-400" />
          </div>

          <p className="text-xs font-semibold text-gray-700 mb-1">Type</p>
          <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 mb-4 gap-2">
            <select className="text-xs outline-none w-full text-gray-400 bg-white">
              <option value="">Sélectionnez un type</option>
              <option value="villa">Villa</option>
              <option value="appartement">Appartement</option>
              <option value="riad">Riad</option>
            </select>
          </div>

          <p className="text-xs font-semibold text-gray-700 mb-1">Secteur</p>
          <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 mb-4 gap-2">
            <select className="text-xs outline-none w-full text-gray-400 bg-white">
              <option value="">Sélectionnez un Secteur</option>
              <option value="gueliz">Guéliz</option>
              <option value="hivernage">Hivernage</option>
              <option value="medina">Médina</option>
            </select>
          </div>

          <p className="text-xs font-semibold text-gray-700 mb-1">Prix</p>
          <div className="flex gap-2 mb-6">
            <input type="text" placeholder="min" value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none" />
            <input type="text" placeholder="max" value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none" />
          </div>

          <button onClick={fetchProperties}
            className="w-full flex items-center justify-center gap-2 bg-[#2C1A0E] text-white text-xs py-2 rounded hover:opacity-90 transition">
            Rechercher <Search size={12} />
          </button>
        </div>

        <div className="flex-1 pt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">
              Résultats: <span className="font-bold">{properties.length} propriétés</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {properties.map((property: any) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}