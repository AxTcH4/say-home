"use client";

import { getWishForm, submitWish } from "@/shared/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type WishFormData = {
  token: string;
  prospectName: string;
  propertyTitle?: string | null;
  submitted: boolean;
};

const propertyTypes = ["RIAD", "VILLA", "APPARTEMENT", "STUDIO"] as const;
const secteurs = [
  "PALMERAIE",
  "TARGA",
  "MEDINA",
  "ROUTE_D_OURIKA",
  "AGDAL",
  "HIVERNAGE",
  "MABROUKA",
  "GUELIZ",
] as const;

export default function WishPage() {
  const params = useParams<{ token: string }>();
  const [token, setToken] = useState("");
  const [form, setForm] = useState<WishFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    type: "",
    secteur: "",
    minPrice: "",
    maxPrice: "",
    minSurface: "",
    maxSurface: "",
    minRooms: "",
    maxRooms: "",
    minBathrooms: "",
    maxBathrooms: "",
    climatisation: false,
    piscine: false,
    jardin: false,
    garage: false,
    securite: false,
    systemeDomotiqueComplet: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!params?.token) return;
        setToken(params.token);
        const data = await getWishForm(params.token);
        if (cancelled) return;
        setForm(data);
        setSubmitted(Boolean(data?.submitted));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Impossible de charger le formulaire");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const showVillaFields = useMemo(
    () => values.type === "VILLA" || values.type === "RIAD",
    [values.type],
  );

  const showGarage = useMemo(() => values.type !== "STUDIO", [values.type]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);
    try {
      await submitWish(token, {
        type: values.type || undefined,
        secteur: values.secteur || undefined,
        minPrice: values.minPrice ? Number(values.minPrice) : undefined,
        maxPrice: values.maxPrice ? Number(values.maxPrice) : undefined,
        minSurface: values.minSurface ? Number(values.minSurface) : undefined,
        maxSurface: values.maxSurface ? Number(values.maxSurface) : undefined,
        minRooms: values.minRooms ? Number(values.minRooms) : undefined,
        maxRooms: values.maxRooms ? Number(values.maxRooms) : undefined,
        minBathrooms: values.minBathrooms ? Number(values.minBathrooms) : undefined,
        maxBathrooms: values.maxBathrooms ? Number(values.maxBathrooms) : undefined,
        climatisation: values.climatisation || undefined,
        piscine: showVillaFields && values.piscine ? true : undefined,
        jardin: showVillaFields && values.jardin ? true : undefined,
        garage: showGarage && values.garage ? true : undefined,
        securite: values.securite || undefined,
        systemeDomotiqueComplet: values.systemeDomotiqueComplet || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer vos souhaits");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <p className="text-sm text-[#666666]">Chargement du formulaire...</p>
      </main>
    );
  }

  if (error && !form) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-[24px] border border-[#eadfd6] bg-white p-10 text-center shadow-[0_18px_48px_rgba(20,32,60,0.08)]">
          <p className="text-lg font-semibold text-[#2c1a0e]">Lien indisponible</p>
          <p className="mt-3 text-sm text-[#666666]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#eadfd6] bg-white p-8 shadow-[0_20px_60px_rgba(20,32,60,0.08)] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6d55]">
          SAY Home
        </p>
        <h1 className="mt-4 text-[34px] font-semibold leading-tight text-[#1f1f1f]">
          Partagez vos souhaits immobiliers
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#666666]">
          {form?.prospectName ? `${form.prospectName}, ` : ""}
          dites-nous les caracteristiques du bien que vous recherchez afin que notre
          equipe puisse vous recommander des proprietes plus pertinentes.
          {form?.propertyTitle ? ` Visite concernee: ${form.propertyTitle}.` : ""}
        </p>

        {submitted ? (
          <div className="mt-8 rounded-[20px] border border-[#dcebdc] bg-[#f4fbf4] p-6">
            <p className="text-lg font-semibold text-[#2f6b3a]">Merci pour vos souhaits</p>
            <p className="mt-2 text-sm text-[#57715d]">
              Vos criteres ont bien ete enregistres. Nous vous contacterons quand une
              propriete correspondante sera disponible.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-[12px] bg-[#2c1a0e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2415]"
            >
              Retour a l'accueil
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Type de bien"
                value={values.type}
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    type: value,
                    piscine: value === "VILLA" || value === "RIAD" ? current.piscine : false,
                    jardin: value === "VILLA" || value === "RIAD" ? current.jardin : false,
                    garage: value === "STUDIO" ? false : current.garage,
                  }))
                }
                options={propertyTypes.map((value) => ({ value, label: value }))}
              />

              <SelectField
                label="Secteur"
                value={values.secteur}
                onChange={(value) => setValues((current) => ({ ...current, secteur: value }))}
                options={secteurs.map((value) => ({ value, label: value.replaceAll("_", " ") }))}
              />

              <NumberField label="Budget minimum" value={values.minPrice} onChange={(value) => setValues((current) => ({ ...current, minPrice: value }))} />
              <NumberField label="Budget maximum" value={values.maxPrice} onChange={(value) => setValues((current) => ({ ...current, maxPrice: value }))} />
              <NumberField label="Surface minimum" value={values.minSurface} onChange={(value) => setValues((current) => ({ ...current, minSurface: value }))} />
              <NumberField label="Surface maximum" value={values.maxSurface} onChange={(value) => setValues((current) => ({ ...current, maxSurface: value }))} />
              <NumberField label="Chambres minimum" value={values.minRooms} onChange={(value) => setValues((current) => ({ ...current, minRooms: value }))} />
              <NumberField label="Chambres maximum" value={values.maxRooms} onChange={(value) => setValues((current) => ({ ...current, maxRooms: value }))} />
              <NumberField label="Salles de bain minimum" value={values.minBathrooms} onChange={(value) => setValues((current) => ({ ...current, minBathrooms: value }))} />
              <NumberField label="Salles de bain maximum" value={values.maxBathrooms} onChange={(value) => setValues((current) => ({ ...current, maxBathrooms: value }))} />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <CheckboxField label="Climatisation" checked={values.climatisation} onChange={(checked) => setValues((current) => ({ ...current, climatisation: checked }))} />
              {showVillaFields ? (
                <>
                  <CheckboxField label="Piscine" checked={values.piscine} onChange={(checked) => setValues((current) => ({ ...current, piscine: checked }))} />
                  <CheckboxField label="Jardin" checked={values.jardin} onChange={(checked) => setValues((current) => ({ ...current, jardin: checked }))} />
                </>
              ) : null}
              {showGarage ? (
                <CheckboxField label="Garage" checked={values.garage} onChange={(checked) => setValues((current) => ({ ...current, garage: checked }))} />
              ) : null}
              <CheckboxField label="Securite" checked={values.securite} onChange={(checked) => setValues((current) => ({ ...current, securite: checked }))} />
              <CheckboxField label="Systeme domotique complet" checked={values.systemeDomotiqueComplet} onChange={(checked) => setValues((current) => ({ ...current, systemeDomotiqueComplet: checked }))} />
            </div>

            {error ? (
              <div className="rounded-[14px] border border-[#f2caca] bg-[#fff8f8] px-4 py-3 text-sm text-[#b84c4c]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex rounded-[14px] bg-[#2c1a0e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2415] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Envoi en cours..." : "Enregistrer mes souhaits"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="space-y-2 text-sm text-[#1f1f1f]">
      <span className="block font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[14px] border border-[#e7dfd7] px-4 py-3 text-sm outline-none focus:border-[#2c1a0e]"
      >
        <option value="">Aucun</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm text-[#1f1f1f]">
      <span className="block font-medium">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[14px] border border-[#e7dfd7] px-4 py-3 text-sm outline-none focus:border-[#2c1a0e]"
      />
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[14px] border border-[#e7dfd7] px-4 py-3 text-sm text-[#1f1f1f]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#2c1a0e]"
      />
      <span>{label}</span>
    </label>
  );
}
