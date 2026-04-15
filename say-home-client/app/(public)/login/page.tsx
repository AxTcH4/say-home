"use client";

import PublicOnlyRoute from "@/components/shared/PublicOnlyRoute";
import LoginForm from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <section className="bg-[#f5f5f3] px-6 py-12 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="max-w-[420px] text-[38px] font-semibold leading-tight text-[#222222] md:text-[50px]">
              Trouvez le lieu qui vous inspire
            </h1>

            <p className="mt-4 text-[18px] text-[#505050] md:text-[22px]">
              subtext blabla
            </p>

            <div className="mt-10 w-full max-w-[360px]">
              <LoginForm />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-[6px] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              <img
                src="/login-image.png"
                alt="Lieu inspirant"
                className="h-[620px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </PublicOnlyRoute>
  );
}
