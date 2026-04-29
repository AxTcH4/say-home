"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock3, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../../shared/components/Navbar";
import Footer from "../../../shared/components/Footer";
import PropertyCard from "../../../features/properties/components/PropertyCard";
import { createVisitRequest, getMyVisitRequests, getPropertyById } from "@/shared/lib/api";
import { useAuth } from "@/features/auth/hooks/useAuth";

type VisitRequestStatus = "REQUESTED" | "SCHEDULED" | "REFUSED" | "CANCELLED" | "COMPLETED";

interface VisitRequestItem {
  id: number;
  propertyId: number;
  propertyTitle: string;
  requestedDate: string;
  requestedTime: string;
  message: string;
  status: VisitRequestStatus;
  agentName: string;
}

const statusCopy: Record<VisitRequestStatus, { label: string; classes: string }> = {
  REQUESTED: {
    label: "En attente",
    classes: "bg-[#fff5db] text-[#8d6510] border-[#f0dba2]",
  },
  SCHEDULED: {
    label: "Acceptee",
    classes: "bg-[#e9f7ef] text-[#1d7f4f] border-[#bfe1ce]",
  },
  REFUSED: {
    label: "Refusee",
    classes: "bg-[#fdecec] text-[#bb4343] border-[#f0c3c3]",
  },
  CANCELLED: {
    label: "Annulee",
    classes: "bg-[#eef2f7] text-[#607080] border-[#d7dde6]",
  },
  COMPLETED: {
    label: "Terminee",
    classes: "bg-[#edf4ff] text-[#3967c4] border-[#cfdcf7]",
  },
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<VisitRequestItem[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [form, setForm] = useState({
    date: "",
    time: "",
    message: "",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id as string);
        if (!data) return;
        setProperty(data.property || null);
        setSimilar(data.similar || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRequests([]);
      return;
    }

    const loadRequests = async () => {
      try {
        const result = await getMyVisitRequests();
        setRequests(result);
      } catch (error) {
        console.error("Unable to load requests", error);
      }
    };

    loadRequests();
  }, [isAuthenticated]);

  const propertyRequests = useMemo(
    () =>
      requests.filter((request) => String(request.propertyId) === String(property?.id)),
    [requests, property?.id]
  );

  const handleRequestVisit = async () => {
    if (!property?.id) return;

    if (!isAuthenticated) {
      toast.error("Connectez-vous pour envoyer une demande de visite.");
      router.push("/auth/login");
      return;
    }

    if (!form.date || !form.time) {
      toast.error("Choisissez une date et une heure pour la visite.");
      return;
    }

    try {
      setRequestLoading(true);
      const created = await createVisitRequest({
        propertyId: property.id,
        date: form.date,
        time: form.time,
        message: form.message,
      });
      setRequests((current) => [created, ...current]);
      setForm({ date: "", time: "", message: "" });
      toast.success("Votre demande a bien ete envoyee au back-office.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'envoyer la demande.");
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-screen w-full">
        <Navbar onHero={false} />
        <div className="flex h-screen flex-col items-center justify-center">
          <Image src="/err-404.png" alt="error 404" width={750} height={50} />
          <p className="relative mt-[-5vw] text-2xl font-bold text-gray-500">Bien non trouve</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white">
      <Navbar onHero={false} />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-20 lg:px-10">
        <div className="mb-8 mt-6 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className="h-80 rounded-[2px] bg-[#f2f2f2] lg:h-[420px]"
            style={{
              backgroundImage: `url(${property.medias?.[0] || "/placeholder.jpg"})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="h-[150px] rounded-[2px] bg-[#f2f2f2] lg:h-[203px]"
                style={{
                  backgroundImage: `url(${property.medias?.[index] || "/placeholder.jpg"})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">{property.title}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={15} />
                  <span>{property.secteur || "Marrakech, Maroc"}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{property.price} MAD</p>
            </div>

            <div className="my-8 flex flex-wrap gap-8 border-y border-gray-100 py-5">
              <Metric icon="/chambres.svg" label={`${property.rooms} chambres`} />
              <Metric icon="/shower.svg" label="4 salles de bain" />
              <Metric icon="/surface.svg" label={`${property.surface} m2`} />
            </div>

            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Description de la propriete</h2>
              <p className="text-sm leading-7 text-gray-600">
                {property.description || "Aucune description disponible."}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Equipements & caracteristiques</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "Climatisation reversible",
                  "Piscine a debordement chauffee",
                  "Systeme domotique complet",
                  "Cave a vin climatisee",
                  "Salle de sport privee",
                  "Securite 24/7 et alarme",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2px] border border-gray-200 p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Reserver une visite</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date souhaitee
                  </span>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                    className="w-full rounded-[2px] border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2C1A0E]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Heure souhaitee
                  </span>
                  <div className="flex items-center rounded-[2px] border border-gray-200 px-3">
                    <Clock3 className="h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      value={form.time}
                      onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                      className="w-full px-2 py-2.5 text-sm outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Votre message
                  </span>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    placeholder="Je souhaiterais visiter cette propriete..."
                    className="w-full resize-none rounded-[2px] border border-gray-200 px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-[#2C1A0E]"
                  />
                </label>
                <button
                  type="button"
                  disabled={requestLoading}
                  onClick={handleRequestVisit}
                  className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#2C1A0E] py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  <Calendar size={14} /> {requestLoading ? "Envoi en cours..." : "Reserver maintenant"}
                </button>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-300">
                  <User size={15} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Agent responsable</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {property.agent
                      ? `${property.agent.firstName} ${property.agent.lastName}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="rounded-[2px] border border-gray-200 bg-[#faf8f5] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Etat de mes demandes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vos demandes de visite pour ce bien apparaissent ici.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2C1A0E]">
                    {propertyRequests.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {propertyRequests.length === 0 ? (
                    <div className="rounded-[2px] border border-dashed border-gray-300 bg-white px-4 py-5 text-sm text-gray-500">
                      Aucune demande envoyee pour cette propriete pour le moment.
                    </div>
                  ) : (
                    propertyRequests.map((request) => {
                      const status = statusCopy[request.status] ?? statusCopy.REQUESTED;
                      return (
                        <div key={request.id} className="rounded-[2px] border border-[#e8e3dc] bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {request.requestedDate} a {request.requestedTime}
                            </p>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.classes}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            {request.message || "Aucun message complementaire."}
                          </p>
                          {request.agentName ? (
                            <p className="mt-2 text-xs font-medium text-gray-500">
                              Agent: {request.agentName}
                            </p>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {similar.length > 0 ? (
          <div className="mb-10 mt-16">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">Proprietes similaires</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {similar.map((item: any, index: number) => (
                <PropertyCard key={index} {...item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}

function Metric({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-2xl">
        <Image src={icon} width={30} height={30} alt="" />
      </span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}
