"use client";

import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import ProtectedRoute from "@/shared/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        < Navbar onHero={false} />
        <main className="flex-1 px-6 py-10 md:px-10 mt-18">
          <div className="mx-auto w-full max-w-225">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
