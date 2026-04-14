import Link from 'next/link';
import { use, useEffect } from 'react';

interface PropertyCardProps {
  id: number;
  main_pic: string;
  secteur: string;
  title: string;
  price: string;
  surface: string;
  rooms: string;
  score: number
}


export default function PropertyCard(property: PropertyCardProps) {
  // useEffect(() => {console}, [property.id, property.main_pic, property.secteur, property.title, property.price, property.surface, property.rooms]);
  return (
    <div className="bg-white border border-gray-200 rounded-[1px] h-[20vw] hover:shadow-[2px_4px_4px_rgba(0,0,0,0.1)] overflow-hidden">
      <div 
      className="w-full h-full " 
      style={{ 
        height: 'clamp(120px, 19vw, 208px)',
        backgroundImage:  property.main_pic ? `url(${ property.main_pic})` : 'url(/placeholder.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
        }}
      />
      <div style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)' }}>
        <div className="flex items-center gap-1 text-gray-500 mb-1" style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}>
          <span>📍</span>
          <span>{ property.secteur}</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-3" style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }}>{ property.title}</h3>
        <div className="flex items-center justify-between text-gray-500" style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}>
          <div className="flex items-center gap-3">
            <span>💰 { property.price}</span>
            <span>📐 { property.surface}</span>
            <span>🛏 { property.rooms}</span>
          </div>
          <Link href={`/properties/${ property.id}`} className="font-medium text-gray-800 hover:underline" style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }}>
            Détails ›
          </Link>
        </div>
      </div>
    </div>
  );
}