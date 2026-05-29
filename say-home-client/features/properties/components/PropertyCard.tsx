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
    <div className="group overflow-hidden rounded-[16px] border border-[#e6dbcf] bg-white shadow-[0_18px_40px_rgba(47,27,16,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_56px_rgba(47,27,16,0.16)]">
      <div
        className="h-full w-full transition duration-300 group-hover:scale-[1.03]"
        style={{
          height: "clamp(180px, 22vw, 240px)",
          backgroundImage: property.medias?.[0]
            ? `url(${property.medias[0]})`
            : "url(/placeholder.jpg)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div style={{ padding: "clamp(0.95rem, 1.8vw, 1.2rem)" }}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-1 text-[#7c6d61]"
            style={{ fontSize: "clamp(0.6rem, 1vw, 0.75rem)", fontFamily: "var(--font-body)" }}
          >
            <span>
              <Image src="/location.svg" alt="" width={14} height={14} />
            </span>
            <span>{secteurLabel}</span>
          </div>

          {typeLabel ? (
            <span
              className="rounded-full border border-[#e4d7ca] bg-[#f8f2eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6f5f53]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {typeLabel}
            </span>
          ) : null}
        </div>

        <h3
          className="mb-3 font-semibold text-[#241912]"
          style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", fontFamily: "var(--font-display)" }}
        >
          {property.title}
        </h3>

        <div
          className="flex items-center justify-between gap-3 text-[#74665b]"
          style={{ fontSize: "clamp(0.68rem, 1vw, 0.78rem)", fontFamily: "var(--font-body)" }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex flex-row gap-1 rounded-full border border-[#ebe1d7] bg-[#fcf8f3] px-2.5 py-1">
              <Image src="/price.svg" alt="" width={14} height={14} /> {property.price}
            </span>
            <span className="flex flex-row gap-1 rounded-full border border-[#ebe1d7] bg-[#fcf8f3] px-2.5 py-1">
              <Image src="/surface.svg" alt="" width={14} height={14} /> {property.surface}
            </span>
            <span className="flex flex-row gap-1 rounded-full border border-[#ebe1d7] bg-[#fcf8f3] px-2.5 py-1">
              <Image src="/rooms.svg" alt="" width={14} height={14} /> {property.rooms}
            </span>
          </div>

          <Link
            href={`/properties/${property.id}`}
            onClick={property.onDetailsClick}
            className="shrink-0 font-medium text-[#2C1A0E] transition hover:text-[#4a2d1e]"
            style={{ fontSize: "clamp(0.72rem, 1.2vw, 0.88rem)", fontFamily: "var(--font-body)" }}
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
