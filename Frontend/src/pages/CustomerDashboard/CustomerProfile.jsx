import { useAuth } from "../../context/AuthContext";
import {
    User, Mail, Phone, Shield, Calendar,
    ClipboardList, Settings, Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";

function getInitials(name) {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const roleColors = {
    customer: "bg-blue-100 text-blue-700",
    provider: "bg-emerald-100 text-emerald-700",
    admin: "bg-purple-100 text-purple-700",
};

export default function CustomerProfile() {
    const { user } = useAuth();
    const role = String(user?.role || "customer").toLowerCase();

    const infoItems = [
        { icon: Mail, label: "Email", value: user?.email || "—" },
        { icon: Phone, label: "Phone", value: user?.phone || "Not set" },
        { icon: Shield, label: "Account Status", value: user?.status || "Active" },
        {
            icon: Calendar,
            label: "Member Since",
            value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                : "—",
        },
    ];

    const quickLinks = [
        { label: "My Bookings", icon: ClipboardList, to: "/customer/bookings", desc: "View and manage your bookings", color: "from-blue-500 to-indigo-600" },
        { label: "Settings", icon: Settings, to: "/customer/settings", desc: "Update your profile information", color: "from-slate-500 to-slate-700" },
        ...(role === "provider" ? [{ label: "Provider Dashboard", icon: Briefcase, to: "/provider", desc: "Manage your provider account", color: "from-emerald-500 to-teal-600" }] : []),
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-sm text-slate-500 mt-1">View your account information and quick links</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
                {/* Avatar Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            getInitials(user?.name)
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{user?.name || "User"}</h2>
                    <p className="text-sm text-slate-500 mt-1 mb-3">{user?.email}</p>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize ${roleColors[role] || roleColors.customer}`}>
                        {role}
                    </span>
                    <Link
                        to="/customer/settings"
                        className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm text-center"
                    >
                        Edit Profile
                    </Link>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
                        <User size={18} className="text-blue-500" />
                        Account Information
                    </h3>
                    <div className="space-y-4">
                        {infoItems.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    <Icon size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map(({ label, icon: Icon, to, desc, color }) => (
                        <Link
                            key={label}
                            to={to}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4"
                        >
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 text-sm">{label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
