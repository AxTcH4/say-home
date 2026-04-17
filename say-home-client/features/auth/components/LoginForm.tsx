"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "../hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (showPassword) {
      document.getElementById("password")!.setAttribute("type", "text");
    } else {
      document.getElementById("password")!.setAttribute("type", "password");
    }
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      setError("");
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await login(formData);
      router.push(APP_ROUTES.HOME);
    } catch (error) {
      setError("Email ou mot de passe incorrect.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[2px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Email
          </label>
          <input
            type="email"
            placeholder="yourname@example.com"
            value={formData.email}
            onChange={handleChange("email")}
            className="h-12 w-full rounded-[2px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#222222]">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              placeholder="************"
              value={formData.password}
              onChange={handleChange("password")}
              className="h-12 w-full rounded-[2px] border border-[#d8d8d8] px-4 text-sm text-[#222222] outline-none placeholder:text-[#9a9a9a] focus:border-[#3b2418]"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#222222]"
              onClick={()=> setShowPassword(!showPassword)}
            >
              <svg
                xmlns="http://w3.org"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-[2px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-[2px] bg-[#2f1b10] text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Connexion..." : "Connexion"}
        </button>

        <div className="flex items-center justify-between text-sm text-[#666666]">
          <Link href={APP_ROUTES.FORGOT_PASSWORD} className="hover:underline">
            Mot de passe oublié ?
          </Link>

          <Link href={APP_ROUTES.SIGNUP} className="hover:underline">
            Créer un compte
          </Link>
        </div>
      </form>
    </div>
  );
}
