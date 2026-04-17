"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_ROUTES } from "@/shared/lib/routes";
import { authService } from "../services/auth.service";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Veuillez entrer votre adresse email.");
      setSuccess("");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      await authService.forgotPassword({ email });

      toast.success("Si cette adresse existe, un lien de réinitialisation a been envoyé.", {duration: 5000, position: "bottom-center"});
      setEmail("");
    } catch (error) {
      setError("Impossible d’envoyer le lien pour le moment.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[2px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Email
          </label>
          <input
            type="email"
            placeholder="yourname@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setSuccess("");
            }}
            className="h-12 w-full rounded-[2px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

        {error && (
          <div className="rounded-[2px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-[2px] border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-[2px] bg-[#2f1b10] text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Envoi..." : "Envoyer le lien"}
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
