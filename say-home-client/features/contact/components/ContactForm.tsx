"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { contactService } from "../services/contact.service";

export default function ContactForm() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      setError("");
      setSuccess("");
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { firstName, lastName, email, message } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      await contactService.sendMessage(formData);

      setSuccess("Votre message a bien été envoyé.");

      setFormData((prev) => ({
        ...prev,
        message: "",
        ...(isAuthenticated && user
          ? {
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
            }
          : {
              firstName: "",
              lastName: "",
              email: "",
            }),
      }));
    } catch (submitError) {
      setError("Impossible d'envoyer votre message pour le moment.");
      console.error(submitError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`rounded-[24px] border border-[#e7ddd2] bg-white p-8 shadow-[0_18px_40px_rgba(47,27,16,0.08)] transition-all duration-700 ease-out ${
        mounted ? "translate-y-0 opacity-100" : "opacity-0"
      }`}
    >
      <h2
        className="text-[26px] font-semibold text-[#241912]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Envoyer un message
      </h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Prénom"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            className="h-12 rounded-[14px] border border-[#ddd0c3] bg-[#fcf8f3] px-4 text-sm text-[#2a1d15] outline-none placeholder:text-[#a08f82] focus:border-[#8a6a50]"
            style={{ fontFamily: "var(--font-body)" }}
          />

          <input
            type="text"
            placeholder="Nom"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            className="h-12 rounded-[14px] border border-[#ddd0c3] bg-[#fcf8f3] px-4 text-sm text-[#2a1d15] outline-none placeholder:text-[#a08f82] focus:border-[#8a6a50]"
            style={{ fontFamily: "var(--font-body)" }}
          />
        </div>

        <input
          type="email"
          placeholder="yourname@example.com"
          value={formData.email}
          onChange={handleChange("email")}
          className="h-12 w-full rounded-[14px] border border-[#ddd0c3] bg-[#fcf8f3] px-4 text-sm text-[#2a1d15] outline-none placeholder:text-[#a08f82] focus:border-[#8a6a50]"
          style={{ fontFamily: "var(--font-body)" }}
        />

        <textarea
          rows={7}
          placeholder="Écrivez votre message..."
          value={formData.message}
          onChange={handleChange("message")}
          className="w-full resize-none rounded-[18px] border border-[#ddd0c3] bg-[#fcf8f3] px-4 py-4 text-sm text-[#2a1d15] outline-none placeholder:text-[#a08f82] focus:border-[#8a6a50]"
          style={{ fontFamily: "var(--font-body)" }}
        />

        {error && (
          <div
            className="rounded-[14px] border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="rounded-[14px] border border-green-300/40 bg-green-500/10 px-3 py-2 text-sm text-green-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-[14px] bg-[#2f1b10] text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {isLoading ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
