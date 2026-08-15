import { NavLink, useNavigate } from "react-router-dom";
import { User, ClipboardList, Settings, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";

const navItems = [
    { label: "Profile", icon: User, path: "/customer/profile", end: true },
    { label: "My Bookings", icon: ClipboardList, path: "/customer/bookings" },
    { label: "Settings", icon: Settings, path: "/customer/settings" },
];

function getInitials(name) {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function CustomerSidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <aside className="w-64 min-h-screen flex flex-col bg-white border-r border-slate-200 shrink-0">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-slate-100 cursor-pointer" onClick={() => navigate("/")}>
                <Logo className="h-8 w-auto" />
            </div>

            {/* User Info */}
            <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            getInitials(user?.name)
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                            {String(user?.role || "").toLowerCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ label, icon: Icon, path, end }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={end}
                        className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className="flex items-center gap-3">
                                    <Icon size={17} className={isActive ? "text-blue-600" : "text-slate-400"} />
                                    {label}
                                </span>
                                {isActive && <ChevronRight size={14} className="text-blue-400" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={17} />
                    Log out
                </button>
            </div>
        </aside>
    );
}
