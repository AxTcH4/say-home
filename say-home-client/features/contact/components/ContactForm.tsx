"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { contactService } from "../services/contact.service";

export default function ContactForm() {
  const { user, isAuthenticated } = useAuth();

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
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
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
    } catch (error) {
      setError("Impossible d’envoyer votre message pour le moment.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[6px] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <h2 className="text-[24px] font-semibold text-[#222222]">
        Envoyer un message
      </h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Prénom"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            className="h-12 rounded-[4px] border border-[#d8d8d8] px-4 text-sm outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />

          <input
            type="text"
            placeholder="Nom"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            className="h-12 rounded-[4px] border border-[#d8d8d8] px-4 text-sm outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

        <input
          type="email"
          placeholder="yourname@example.com"
          value={formData.email}
          onChange={handleChange("email")}
          className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
        />

        <textarea
          rows={7}
          placeholder="Écrivez votre message..."
          value={formData.message}
          onChange={handleChange("message")}
          className="w-full resize-none rounded-[4px] border border-[#d8d8d8] px-4 py-4 text-sm outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
        />

        {error && (
          <div className="rounded-[4px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-[4px] border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-[4px] bg-[#2f1b10] text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}