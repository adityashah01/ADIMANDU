import {
  LayoutDashboard,
  CalendarDays,
  IndianRupee,
  Star,
  Clock3,
  User,
  Settings,
  LogOut,
  ClipboardList
} from "lucide-react";

import { NavLink } from "react-router-dom";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/provider/dashboard" },
  { title: "Bookings", icon: CalendarDays, path: "/provider/bookings" },
  { title: "Service Requests", icon: ClipboardList, path: "/provider/service-requests" },
  { title: "My Services", icon: ClipboardList, path: "/provider/services" },
  { title: "Earnings", icon: IndianRupee, path: "/provider/earnings" },
  { title: "Reviews", icon: Star, path: "/provider/reviews" },
  { title: "Availability", icon: Clock3, path: "/provider/availability" },
  { title: "Profile", icon: User, path: "/provider/profile" },
  { title: "Settings", icon: Settings, path: "/provider/settings" },
];

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ProviderSidebar() {
  const { user, logout } = useAuth();
  
  return (
    <aside
      className="w-72 h-screen flex flex-col font-body"
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
          Provider desk
        </p>
      </div>

      {/* Profile */}
      <div className="px-7 py-6 flex items-center gap-4" style={{ borderBottom: "1px solid #EFEBDF" }}>
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-display font-semibold text-lg shrink-0"
            style={{ background: "#3B6E8F" }}
          >
            {initials(user?.name || "Provider User")}
          </div>
        )}

        <div className="min-w-0">
          <h2 className="font-semibold truncate" style={{ color: "#20261F" }}>
            {user?.name || "Provider"}
          </h2>
          <p className="text-sm" style={{ color: "#8A8A78" }}>
            {user?.providerProfile?.category?.name || "Service Provider"}
          </p>
          {user?.providerProfile?.averageRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5" style={{ fill: "#E8A33D", color: "#E8A33D" }} />
              <span className="text-sm font-medium" style={{ color: "#20261F" }}>
                {Number(user.providerProfile.averageRating).toFixed(1)}
              </span>
              {user.providerProfile.reviewCount > 0 && (
                <span className="text-xs" style={{ color: "#8A8A78" }}>
                  ({user.providerProfile.reviewCount})
                </span>
              )}
            </div>
          )}
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
                      background: "#E8A33D",
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
          onClick={logout}
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