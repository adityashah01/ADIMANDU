import { Outlet } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";

export default function CustomerLayout() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <CustomerSidebar />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
