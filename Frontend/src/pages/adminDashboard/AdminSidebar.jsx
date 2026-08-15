import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  LogOut,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin", end: true },
  { title: "Applications", icon: ClipboardList, path: "/admin/applications" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Bookings", icon: CalendarDays, path: "/admin/bookings" },
  { title: "Platform Earnings", icon: TrendingUp, path: "/admin/earnings" },
];

function initials(name) {
  return name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AD";
}

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className="w-72 h-screen flex flex-col font-body shrink-0"
      style={{ background: "#FFFFFF", borderRight: "1px solid #E7E2D4" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      {/* Logo */}
      <div className="px-7 py-7" style={{ borderBottom: "1px solid #EFEBDF" }}>
        <div className="flex items-center gap-2 justify-center">
          <Logo className="h-8 w-auto" />
        </div>
        <p className="text-xs uppercase tracking-widest mt-2 text-center" style={{ color: "#8A8A78" }}>
          Admin Portal
        </p>
      </div>

      {/* Profile */}
      <div className="px-7 py-6 flex items-center gap-4" style={{ borderBottom: "1px solid #EFEBDF" }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-display font-semibold text-lg shrink-0"
          style={{ background: "#B24C3C" }}
        >
          {initials(user?.name)}
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold truncate" style={{ color: "#20261F" }}>
            {user?.name || "Administrator"}
          </h2>
          <p className="text-sm" style={{ color: "#8A8A78" }}>
            System Admin
          </p>
          <div className="flex items-center gap-1 mt-1">
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: "#B24C3C" }} />
            <span className="text-xs font-medium" style={{ color: "#20261F" }}>
              Full Access
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 pl-4 pr-4 py-3 rounded-lg font-medium text-sm transition-colors relative`
              }
              style={({ isActive }) => ({
                color: isActive ? "#20261F" : "#6B6B63",
                background: isActive ? "#F1EEE3" : "transparent",
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all"
                    style={{
                      height: isActive ? "60%" : "0%",
                      background: "#B24C3C",
                    }}
                  />
                  <Icon size={19} />
                  {item.title}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-5" style={{ borderTop: "1px solid #EFEBDF" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors font-medium text-sm hover:bg-[#FBEEEC]"
          style={{ color: "#B24C3C" }}
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
