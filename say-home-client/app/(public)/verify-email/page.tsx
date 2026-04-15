"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { APP_ROUTES } from "@/lib/routes";
import { authService } from "@/modules/auth/services/auth.service";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verification de votre inscription...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Lien de verification invalide.");
        return;
      }

      try {
        await authService.verifyRegistration(token);
        setStatus("success");
        setMessage("Votre compte est confirme. Vous pouvez maintenant vous connecter.");
      } catch (error) {
        setStatus("error");
        setMessage("Lien de verification invalide ou expire.");
        console.error(error);
      }
    };

    verify();
  }, [token]);

  return (
    <section className="bg-[#f5f5f3] px-6 py-12 md:px-10 md:py-14">
      <div className="mx-auto flex max-w-[900px] justify-center">
        <div className="w-full max-w-[520px] rounded-[6px] bg-white p-8 text-center shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          <h1 className="text-[34px] font-semibold leading-tight text-[#222222]">
            Confirmation du compte
          </h1>

          <p
            className={`mt-5 text-sm leading-6 ${
              status === "error" ? "text-red-700" : "text-[#555555]"
            }`}
          >
            {message}
          </p>

          {status === "success" && (
            <Link
              href={APP_ROUTES.LOGIN}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-[4px] bg-[#2f1b10] px-6 text-sm font-medium text-white transition hover:opacity-95"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-[#f5f5f3] px-6 py-12 md:px-10 md:py-14">
          <div className="mx-auto flex max-w-[900px] justify-center">
            <div className="w-full max-w-[520px] rounded-[6px] bg-white p-8 text-center shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <p className="text-sm text-[#555555]">Verification de votre inscription...</p>
            </div>
          </div>
        </section>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
