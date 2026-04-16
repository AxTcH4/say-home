"use client";

import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import ProtectedRoute from "@/shared/components/shared/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#f5f5f3]">
        < Navbar onHero={false} />
        <main className="flex-1 px-6 py-10 md:px-10">
          <div className="mx-auto w-full max-w-225">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
