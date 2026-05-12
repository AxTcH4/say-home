"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "../../shared/components/Navbar";
import Footer from "../../shared/components/Footer";
import PropertyCard from "../../features/properties/components/PropertyCard";
import { getAllProperties, searchProperties } from "../../shared/lib/api";

const searchSchema = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
  secteur: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minSurface: z.coerce.number().optional(),
  minRooms: z.coerce.number().optional(),
});

const defaultFilters = {
  title: "",
  type: "",
  secteur: "",
  minPrice: "",
  maxPrice: "",
  minSurface: "",
  minRooms: "",
};

const PROPERTY_TYPE_OPTIONS = [
  { value: "villa", label: "Villa" },
  { value: "appartement", label: "Appartement" },
  { value: "riad", label: "Riad" },
  { value: "studio", label: "Studio" },
];

const PROPERTY_SECTEUR_OPTIONS = [
  { value: "palmeraie", label: "Palmeraie" },
  { value: "targa", label: "Targa" },
  { value: "medina", label: "Medina" },
  { value: "route-d-ourika", label: "Route d'Ourika" },
  { value: "agdal", label: "Agdal" },
  { value: "hivernage", label: "Hivernage" },
  { value: "mabrouka", label: "Mabrouka" },
];

export default function PropertiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<"404" | "400" | "500" | null>(null);
  const [filters, setFilters] = useState(defaultFilters);

  const resultsLabel = useMemo(
    () => `${items.length} propriete${items.length > 1 ? "s" : ""}`,
    [items.length]
  );

  const mapProperty = (p: any) => ({
    id: p.id,
    description: p.description,
    title: p.title,
    type: p.type,
    secteur: p.secteur,
    medias: p.medias,
    price: `${p.price} MAD${p.offerType === "RENT" ? " / mois" : ""}`,
    surface: p.surface ? `${p.surface} M2` : "N/A",
    rooms: p.rooms ? `${p.rooms} chambre(s)` : "N/A",
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await getAllProperties();
      setItems(Array.isArray(data) ? data.map(mapProperty) : []);
      setError(null);
    } catch (fetchError) {
      console.error("Erreur:", fetchError);
      setItems([]);
      setError("500");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const data = searchSchema.parse({
        title: filters.title.trim(),
        type: filters.type.trim(),
        secteur: filters.secteur.trim(),
        minPrice: filters.minPrice || 0,
        maxPrice: filters.maxPrice || 0,
        minSurface: filters.minSurface || 0,
        minRooms: filters.minRooms || 0,
      });

      if (Number(filters.maxPrice) !== 0 && Number(filters.minPrice) > Number(filters.maxPrice)) {
        toast.error("Le prix minimum doit etre inferieur au prix maximum.", {
          duration: 3000,
          position: "top-center",
        });
        return;
      }

      if (Number(filters.minPrice) < 0 || Number(filters.maxPrice) < 0) {
        toast.error("Le prix doit etre positif.", {
          duration: 3000,
          position: "top-center",
        });
        return;
      }

      const result = await searchProperties(data);

      if (!result || result.status === 500) {
        setItems([]);
        setError("500");
        toast.error("Une erreur est survenue pendant la recherche.", {
          duration: 3000,
          position: "top-center",
        });
        return;
      }

      if (result.status === 400) {
        setItems([]);
        setError("400");
        toast.error("Un ou plusieurs champs sont invalides.", {
          duration: 3000,
          position: "top-center",
        });
        return;
      }

      if (result.status === 404 || !result.data?.length) {
        setItems([]);
        setError("404");
        toast.error("Aucun bien ne correspond a votre recherche.", {
          duration: 3000,
          position: "top-center",
        });
        return;
      }

      setItems(
        result.data.map((item: any) => ({
          id: item.property.id,
          description: item.property.description || "Aucune description",
          type: item.property.type || "N/A",
          secteur: item.property.secteur || "Unknown location",
          title: item.property.title,
          price: `${item.property.price} MAD${item.property.offerType === "RENT" ? " / mois" : ""}`,
          surface: item.property.surface ? `${item.property.surface} M2` : "N/A",
          rooms: item.property.rooms ? `${item.property.rooms} chambre(s)` : "N/A",
          medias: item.property.medias,
          score: item.score,
        }))
      );
      setError(null);
    } catch (submitError) {
      console.error(submitError);
      setItems([]);
      setError("500");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = async () => {
    setFilters(defaultFilters);
    await fetchProperties();
  };

  return (
    <main className="bg-[#fcfbf8]">
      <Navbar onHero={false} />
      <div className="mx-auto min-h-screen max-w-7xl px-6 pb-14 pt-24 lg:px-10">
        <section className="rounded-[2px] border border-[#e7ddd2] bg-gradient-to-r from-[#fbf7f1] via-white to-[#f4efe7] px-6 py-8 shadow-[0_16px_40px_rgba(47,27,16,0.06)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e2d5c7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#7a6655]">
                <Sparkles className="h-3.5 w-3.5" />
                Recherche sur mesure
              </div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#22160f] lg:text-[54px]">
                Explorez des biens qui collent vraiment a votre projet.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#6e6258]">
                Affinez par type, secteur et budget pour trouver rapidement les biens les plus pertinents.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <QuickStat label="Resultats visibles" value={resultsLabel} />
              <QuickStat label="Secteurs suivis" value="Palmeraie, Agdal, Hivernage" />
              <QuickStat label="Experience" value="Recherche rapide et claire" />
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <form
            onSubmit={handleSearch}
            className="h-fit rounded-[2px] border border-[#e5ddd2] bg-white p-5 shadow-[0_16px_35px_rgba(47,27,16,0.06)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#2C1A0E]" />
                <h2 className="text-lg font-semibold text-[#22160f]">Filtres</h2>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#7a6655] transition hover:text-[#2C1A0E]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reinitialiser
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Recherche">
                <div className="flex items-center rounded-[2px] border border-[#d8d1c8] bg-[#fbfaf8] px-3">
                  <Search className="h-4 w-4 text-[#988b7f]" />
                  <input
                    value={filters.title}
                    onChange={(event) => setFilters((current) => ({ ...current, title: event.target.value }))}
                    type="text"
                    placeholder="Que recherchez-vous ?"
                    className="w-full bg-transparent px-2 py-3 text-sm outline-none placeholder:text-[#b4a89d]"
                  />
                </div>
              </Field>

              <Field label="Type de bien">
                <select
                  value={filters.type}
                  onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                  className="w-full rounded-[2px] border border-[#d8d1c8] bg-[#fbfaf8] px-3 py-3 text-sm text-[#4a4038] outline-none"
                >
                  <option value="">Selectionnez un type</option>
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Secteur">
                <select
                  value={filters.secteur}
                  onChange={(event) => setFilters((current) => ({ ...current, secteur: event.target.value }))}
                  className="w-full rounded-[2px] border border-[#d8d1c8] bg-[#fbfaf8] px-3 py-3 text-sm text-[#4a4038] outline-none"
                >
                  <option value="">Selectionnez un secteur</option>
                  {PROPERTY_SECTEUR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Budget (MAD)">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
                    placeholder="Min"
                    className="rounded-[2px] border border-[#d8d1c8] bg-[#fbfaf8] px-3 py-3 text-sm outline-none"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
                    placeholder="Max"
                    className="rounded-[2px] border border-[#d8d1c8] bg-[#fbfaf8] px-3 py-3 text-sm outline-none"
                  />
                </div>
              </Field>

              <Field label="Surface minimum (m²)">
                <input
                  type="number"
                  value={filters.minSurface}
                  onChange={(event) => setFilters((current) => ({ ...current, minSurface: event.target.value }))}
                  placeholder="Ex: 80"
                  className="w-full rounded-[2px] border border-[#d8d1c8] bg-[#fbfaf8] px-3 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="Chambres minimum">
                <input
                  type="number"
                  value={filters.minRooms}
                  onChange={(event) => setFilters((current) => ({ ...current, minRooms: event.target.value }))}
                  placeholder="Ex: 3"
                  className="w-full rounded-[2px] border border-[#d8d1c8] bg-[#fbfaf8] px-3 py-3 text-sm outline-none"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#2C1A0E] py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {submitting ? "Recherche..." : "Lancer la recherche"} <Search size={14} />
            </button>
          </form>

          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-[2px] border border-[#ece4da] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(47,27,16,0.04)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7d6f]">
                  Catalogue Say Home
                </p>
                <p className="mt-1 text-sm text-[#5f544c]">
                  {loading ? "Chargement des biens..." : `Resultats: ${resultsLabel}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-medium text-[#6d6259]">
                {filters.type && (
                  <FilterChip
                    label={PROPERTY_TYPE_OPTIONS.find((option) => option.value === filters.type)?.label ?? filters.type}
                  />
                )}
                {filters.secteur && (
                  <FilterChip
                    label={
                      PROPERTY_SECTEUR_OPTIONS.find((option) => option.value === filters.secteur)?.label ??
                      filters.secteur
                    }
                  />
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <FilterChip
                    label={`${filters.minPrice || "0"} - ${filters.maxPrice || "∞"} MAD`}
                  />
                )}
              </div>
            </div>

            {error === "400" ? (
              <EmptyState
                title="Requete invalide"
                description="Verifiez les champs remplis puis relancez la recherche."
              />
            ) : error === "404" ? (
              <div className="rounded-[2px] border border-[#ece4da] bg-white p-8 shadow-[0_16px_35px_rgba(47,27,16,0.06)]">
                <p className="text-sm font-medium text-gray-700">
                  Resultats: <span className="font-bold">0 propriete</span>
                </p>
                <div className="mt-7 flex flex-col items-center justify-center">
                  <Image src="/err-404.png" alt="error 404" width={450} height={50} />
                  <p className="mt-[-3.5vw] text-2xl font-bold text-gray-500">Aucun bien trouve</p>
                </div>
              </div>
            ) : error === "500" ? (
              <EmptyState
                title="Une erreur interne est survenue"
                description="La liste n'a pas pu etre chargee correctement. Reessayez dans un instant."
              />
            ) : loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[360px] animate-pulse rounded-[2px] border border-[#ece4da] bg-white"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item: any, index: number) => (
                  <PropertyCard key={index} {...item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6655]">
        {label}
      </span>
      {children}
    </label>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2px] border border-[#e3d9cb] bg-white/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d7d6f]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#2a1d15]">{value}</p>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[#ddd0c3] bg-[#faf6f0] px-3 py-1 text-[#6d6259]">
      {label}
    </span>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[2px] border border-[#ece4da] bg-white px-6 py-10 text-center shadow-[0_16px_35px_rgba(47,27,16,0.06)]">
      <h3 className="text-2xl font-semibold text-[#2a1d15]">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6a5f56]">{description}</p>
    </div>
  );
}
