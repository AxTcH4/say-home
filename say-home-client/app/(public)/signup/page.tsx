"use client";

import PublicOnlyRoute from "@/components/shared/PublicOnlyRoute";
import SignupForm from "@/modules/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <PublicOnlyRoute>
      <section className="bg-[#f5f5f3] px-6 py-12 md:px-10 md:py-14">
        <div className="mx-auto flex max-w-[1100px] justify-center">
          <div className="w-full max-w-[520px]">
            <div className="mb-8 text-left">
              <h1 className="text-[40px] font-semibold leading-tight text-[#222222] md:text-[48px]">
                Commencez sur SAY home
              </h1>

              <p className="mt-4 max-w-[520px] text-[16px] leading-7 text-[#555555]">
                kdhzaopdkpakazdadzepz aeipzaepo aziepzoepo
                apoziaeziepoiapoiezapoeipazop
              </p>
            </div>

            <SignupForm />
          </div>
        </div>
      </section>
    </PublicOnlyRoute>
  );
}