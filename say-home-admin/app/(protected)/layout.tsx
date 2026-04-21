import SideBar from "@/shared/components/SideBar";
import TopBar from "@/shared/components/TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex flex-col flex-1 ">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 ml-[5%]">{children}</main>
      </div>
    </div>
  );
}
