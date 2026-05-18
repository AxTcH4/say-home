import Link from "next/link";
import Image from "next/image";

interface PropertyCardProps {
  id: number;
  medias: string[];
  secteur?: string | null;
  title: string;
  price?: string | number | null;
  surface?: string | number | null;
  rooms?: string | number | null;
  type?: string | null;
  score?: number;
  onDetailsClick?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  RIAD: "Riad",
  VILLA: "Villa",
  APPARTEMENT: "Appartement",
  STUDIO: "Studio",
};

const SECTEUR_LABELS: Record<string, string> = {
  GUELIZ: "Gueliz",
  PALMERAIE: "Palmeraie",
  TARGA: "Targa",
  MEDINA: "Medina",
  ROUTE_D_OURIKA: "Route d'Ourika",
  AGDAL: "Agdal",
  HIVERNAGE: "Hivernage",
  MABROUKA: "Mabrouka",
};

export default function PropertyCard(property: PropertyCardProps) {
  const secteurLabel = property.secteur
    ? (SECTEUR_LABELS[property.secteur] ?? property.secteur)
    : "Marrakech";
  const typeLabel = property.type ? (TYPE_LABELS[property.type] ?? property.type) : null;

  return (
    <div className="overflow-hidden rounded-sm border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div
        className="h-full w-full"
        style={{
          height: "clamp(120px, 19vw, 208px)",
          backgroundImage: property.medias?.[0]
            ? `url(${property.medias[0]})`
            : "url(/placeholder.jpg)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div style={{ padding: "clamp(0.75rem, 1.5vw, 1rem)" }}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-1 text-gray-500"
            style={{ fontSize: "clamp(0.6rem, 1vw, 0.75rem)" }}
          >
            <span>
              <Image src="/location.svg" alt="" width={14} height={14} />
            </span>
            <span>{secteurLabel}</span>
          </div>

          {typeLabel ? (
            <span className="rounded-full border border-[#ddd0c3] bg-[#faf6f0] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6d6259]">
              {typeLabel}
            </span>
          ) : null}
        </div>

        <h3
          className="mb-3 font-semibold text-gray-800"
          style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.875rem)" }}
        >
          {property.title}
        </h3>

        <div
          className="flex items-center justify-between text-gray-500"
          style={{ fontSize: "clamp(0.6rem, 1vw, 0.75rem)" }}
        >
          <div className="flex items-center gap-3">
            <span className="d flex flex-row gap-1">
              <Image src="/price.svg" alt="" width={14} height={14} /> {property.price}
            </span>
            <span className="d flex flex-row gap-1">
              <Image src="/surface.svg" alt="" width={14} height={14} /> {property.surface}
            </span>
            <span className="d flex flex-row gap-1">
              <Image src="/rooms.svg" alt="" width={14} height={14} /> {property.rooms}
            </span>
          </div>

          <Link
            href={`/properties/${property.id}`}
            onClick={property.onDetailsClick}
            className="font-medium text-gray-800 hover:underline"
            style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.875rem)" }}
          >
            Details &gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
