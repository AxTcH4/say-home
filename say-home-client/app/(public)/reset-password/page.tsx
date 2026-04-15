"use client";

import PublicOnlyRoute from "@/components/shared/PublicOnlyRoute";
import ResetPasswordForm from "@/modules/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <PublicOnlyRoute>
      <section className="bg-[#f5f5f3] px-6 py-12 md:px-10 md:py-14">
        <div className="mx-auto flex max-w-[900px] justify-center">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 text-left">
              <h1 className="text-[38px] font-semibold leading-tight text-[#222222] md:text-[46px]">
                Réinitialiser le mot de passe
              </h1>

              <p className="mt-4 text-[16px] leading-7 text-[#555555]">
                Saisissez votre nouveau mot de passe pour sécuriser votre
                compte.
              </p>
            </div>

            <ResetPasswordForm />
          </div>
        </div>
      </section>
    </PublicOnlyRoute>
  );
}