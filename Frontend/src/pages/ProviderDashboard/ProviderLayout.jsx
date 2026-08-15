import { Outlet } from "react-router-dom";
import ProviderSidebar from "./ProviderSidebar";

export default function ProviderLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: "#F6F3EC" }}>
      <ProviderSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}