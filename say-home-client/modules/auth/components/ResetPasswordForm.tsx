"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { APP_ROUTES } from "@/lib/routes";
import { authService } from "../services/auth.service";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setError("Lien invalide ou token manquant.");
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      await authService.resetPassword({
        token,
        password,
        confirmPassword,
      });

      setSuccess("Votre mot de passe a été réinitialisé avec succès.");

      setTimeout(() => {
        router.push(APP_ROUTES.LOGIN);
      }, 1200);
    } catch (error) {
      setError("Impossible de réinitialiser le mot de passe.");
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
            Nouveau mot de passe
          </label>
          <input
            type="password"
            placeholder="************"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setSuccess("");
            }}
            className="h-12 w-full rounded-[4px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Confirmez le mot de passe
          </label>
          <input
            type="password"
            placeholder="************"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
              setSuccess("");
            }}
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
          {isLoading ? "Réinitialisation..." : "Réinitialiser"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#666666]">
        Retour à{" "}
        <Link
          href={APP_ROUTES.LOGIN}
          className="font-medium text-[#2f1b10] hover:underline"
        >
          la connexion
        </Link>
      </p>
    </div>
  );
}