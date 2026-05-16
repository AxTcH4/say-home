"use client";

import { getFeedbackForm, submitFeedback } from "@/shared/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type FeedbackFormData = {
  token: string;
  prospectName: string;
  contextStatus: string;
  propertyTitle?: string | null;
  submitted: boolean;
};

function contextLabel(status: string) {
  switch (status) {
    case "BOUGHT":
      return "votre achat";
    case "RENTED":
      return "votre location";
    case "LOST":
      return "votre dossier";
    default:
      return "votre experience";
  }
}

export default function FeedbackPage() {
  const params = useParams<{ token: string }>();
  const [token, setToken] = useState("");
  const [form, setForm] = useState<FeedbackFormData | null>(null);
  const [sentiment, setSentiment] = useState<"POSITIVE" | "NEGATIVE" | "">("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!params?.token) return;
        if (cancelled) return;
        setToken(params.token);
        const data = await getFeedbackForm(params.token);
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

    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const heading = useMemo(() => {
    if (!form) return "Votre avis compte";
    return `Votre avis sur ${contextLabel(form.contextStatus)}`;
  }, [form]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !sentiment) {
      setError("Veuillez choisir un avis positif ou negatif.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await submitFeedback(token, {
        sentiment,
        comment,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer votre avis");
    } finally {
      setSaving(false);
    }
  };

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
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[#eadfd6] bg-white p-8 shadow-[0_20px_60px_rgba(20,32,60,0.08)] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6d55]">
          SAY Home
        </p>
        <h1 className="mt-4 text-[34px] font-semibold leading-tight text-[#1f1f1f]">
          {heading}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#666666]">
          {form?.prospectName ? `${form.prospectName}, ` : ""}
          dites-nous simplement si votre experience a ete positive ou negative.
          {form?.propertyTitle ? ` Bien concerne: ${form.propertyTitle}.` : ""}
        </p>

        {submitted ? (
          <div className="mt-8 rounded-[20px] border border-[#dcebdc] bg-[#f4fbf4] p-6">
            <p className="text-lg font-semibold text-[#2f6b3a]">Merci pour votre retour</p>
            <p className="mt-2 text-sm text-[#57715d]">
              Votre avis a bien ete enregistre. Notre equipe vous remercie pour votre confiance.
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
              <button
                type="button"
                onClick={() => setSentiment("POSITIVE")}
                className={`rounded-[18px] border px-6 py-6 text-left transition ${
                  sentiment === "POSITIVE"
                    ? "border-[#2f8a4b] bg-[#f4fbf4]"
                    : "border-[#e7dfd7] hover:border-[#2f8a4b]"
                }`}
              >
                <p className="text-base font-semibold text-[#1f1f1f]">Avis positif</p>
                <p className="mt-2 text-sm text-[#666666]">
                  Tout s'est bien passe et vous etes satisfait.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSentiment("NEGATIVE")}
                className={`rounded-[18px] border px-6 py-6 text-left transition ${
                  sentiment === "NEGATIVE"
                    ? "border-[#b84c4c] bg-[#fff6f6]"
                    : "border-[#e7dfd7] hover:border-[#b84c4c]"
                }`}
              >
                <p className="text-base font-semibold text-[#1f1f1f]">Avis negatif</p>
                <p className="mt-2 text-sm text-[#666666]">
                  L'experience n'a pas repondu a vos attentes.
                </p>
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1f1f1f]">
                Commentaire
              </label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={5}
                placeholder="Vous pouvez ajouter un commentaire si vous le souhaitez..."
                className="w-full rounded-[18px] border border-[#e7dfd7] px-4 py-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-[#a59a90] focus:border-[#2c1a0e]"
              />
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
              {saving ? "Envoi en cours..." : "Envoyer mon avis"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
