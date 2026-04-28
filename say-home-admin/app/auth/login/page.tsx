"use client";

import LoginForm from "@/features/auth/components/LoginForm";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";

export default function LoginPage() {
  return (
    <>
      <div className="mb-[10vh]">
        <Navbar onHero={false} />
      </div>
      <section className="px-6 py-12 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="max-w-[420px] text-[38px] font-semibold leading-tight text-[#222222] md:text-[50px]">
              Say Home Admin
            </h1>

            <p className="mt-4 max-w-[440px] text-[18px] text-[#505050] md:text-[22px]">
              Acces reserve aux administrateurs et aux agents autorises du
              back-office.
            </p>

            <div className="mt-10 w-full max-w-[360px]">
              <LoginForm />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-[2px] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              <video
                src="/login-vid.mp4"
                autoPlay
                loop
                muted
                className="h-[620px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
