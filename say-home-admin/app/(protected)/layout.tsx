import SideBar from "@/shared/components/SideBar";
import TopBar from "@/shared/components/TopBar";

export default function Layout({ children}: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex flex-col flex-1 ">
        <TopBar />
        <main className="flex-1 overflow-hidden p-4 ">{children}</main>
      </div>
    </div>
  );
}
