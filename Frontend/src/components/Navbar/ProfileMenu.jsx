import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, ClipboardList, Settings, LogOut, Briefcase, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function getInitials(name) {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function ProfileMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = async () => {
        await logout();
        setOpen(false);
        navigate("/login");
    };

    const role = String(user?.role || "").toLowerCase();

    const menuItems = role === "provider"
        ? [
            { label: "Provider Dashboard", icon: Briefcase, to: "/provider" },
            { label: "Manage Bookings", icon: ClipboardList, to: "/provider" },
            { label: "Settings", icon: Settings, to: "/provider" },
          ]
        : role === "admin"
        ? [
            { label: "Admin Console", icon: ShieldCheck, to: "/admin" },
          ]
        : [
            { label: "My Profile", icon: User, to: "/customer/profile" },
            { label: "My Bookings", icon: ClipboardList, to: "/customer/bookings" },
            { label: "Settings", icon: Settings, to: "/customer/settings" },
          ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 cursor-pointer group"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:shadow-md transition-shadow">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        getInitials(user?.name)
                    )}
                </div>
                <ChevronDown
                    size={14}
                    className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                                {getInitials(user?.name)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                                    {role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        {menuItems.map(({ label, icon: Icon, to }) => (
                            <Link
                                key={label}
                                to={to}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                            >
                                <Icon size={16} className="text-slate-400" />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 pt-1">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors"
                        >
                            <LogOut size={16} />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;
