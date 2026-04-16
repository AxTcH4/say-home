import Footer from "../../shared/components/Footer";
import Navbar from "../../shared/components/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1f1f1f] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[1500px] flex-col overflow-hidden border border-[#1f1f1f] bg-[#f5f5f3]">
        <Navbar onHero={false} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}