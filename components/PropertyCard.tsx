import Link from 'next/link';

interface PropertyCardProps {
  id: number;
  location: string;
  title: string;
  price: string;
  surface: string;
  rooms: string;
}

export default function PropertyCard({ id, location, title, price, surface, rooms }: PropertyCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      {/* Image placeholder */}
      <div className="w-full h-52 bg-gray-300" />

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <span>📍</span>
          <span>{location}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>💰 {price}</span>
            <span>📐 {surface}</span>
            <span>🛏 {rooms}</span>
          </div>
          <Link
            href={`/properties/${id}`}
            className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:underline"
          >
            Détails ›
          </Link>
        </div>
      </div>
    </div>
  );
}