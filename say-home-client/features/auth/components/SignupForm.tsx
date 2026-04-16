"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "../hooks/useAuth";

export default function SignupForm() {
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      setError("");
      setSuccess("");
    };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
    } = formData;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      return "Tous les champs obligatoires doivent être remplis.";
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Veuillez entrer une adresse email valide.";
    }

    if (phone.trim() && !/^[0-9]{10}$/.test(phone)) {
      return "Le numéro de téléphone doit contenir exactement 10 chiffres.";
    }

    if (password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      await signup(formData);
      setSuccess("Compte presque pret. Verifiez votre email pour confirmer votre inscription.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError("Inscription impossible pour le moment.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[6px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Nom complet
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
            />

            <input
              type="text"
              placeholder="Nom"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Numéro de téléphone
          </label>
          <input
            type="text"
            placeholder="0612345678"
            value={formData.phone}
            onChange={handleChange("phone")}
            className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Email
          </label>
          <input
            type="email"
            placeholder="yourname@example.com"
            value={formData.email}
            onChange={handleChange("email")}
            className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="************"
            value={formData.password}
            onChange={handleChange("password")}
            className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Confirmez votre mot de passe
          </label>
          <input
            type="password"
            placeholder="************"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

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
          {isLoading ? "Inscription..." : "Inscription"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#666666]">
        Vous avez déjà un compte ?{" "}
        <Link
          href={APP_ROUTES.LOGIN}
          className="font-medium text-[#2f1b10] hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
