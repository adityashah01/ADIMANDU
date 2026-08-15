import { useAuth } from "../../context/AuthContext";
import { User, Mail, Phone, Calendar, ClipboardList, Briefcase } from "lucide-react";

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ProviderProfile() {
  const { user } = useAuth();
  const role = String(user?.role || "provider").toLowerCase();

  return (
    <div className="p-6 md:p-10 font-body" style={{ color: "#20261F" }}>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest" style={{ color: "#8A8A78" }}>
          Account
        </span>
        <h1 className="font-display text-3xl font-semibold mt-1">My Profile</h1>
        <p className="mt-1" style={{ color: "#6B6B63" }}>
          View your public details and profile status. To edit this information, go to Settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        {/* Avatar Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center" style={{ border: "1px solid #E7E2D4" }}>
          <div className="w-28 h-28 rounded-full bg-[#3B6E8F] flex items-center justify-center text-white font-bold text-3xl shadow-sm mb-5" style={{ border: "4px solid #F1EEE3" }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <h2 className="text-xl font-bold font-display">{user?.name || "Provider User"}</h2>
          <p className="text-sm mt-1 mb-4" style={{ color: "#8A8A78" }}>{user?.email}</p>
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize bg-emerald-100 text-emerald-700">
            {role}
          </span>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8" style={{ border: "1px solid #E7E2D4" }}>
          <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg">
            <User size={20} style={{ color: "#3B6E8F" }} />
            Account Information
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-4 py-3 border-b border-[#F1EEE3]">
              <div className="w-10 h-10 rounded-lg bg-[#FBFAF6] flex items-center justify-center shrink-0">
                <Mail size={18} style={{ color: "#8A8A78" }} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8A8A78" }}>Email</p>
                <p className="text-sm font-semibold mt-0.5">{user?.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-[#F1EEE3]">
              <div className="w-10 h-10 rounded-lg bg-[#FBFAF6] flex items-center justify-center shrink-0">
                <Phone size={18} style={{ color: "#8A8A78" }} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8A8A78" }}>Phone</p>
                <p className="text-sm font-semibold mt-0.5">{user?.phone || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-[#F1EEE3]">
              <div className="w-10 h-10 rounded-lg bg-[#FBFAF6] flex items-center justify-center shrink-0">
                <Briefcase size={18} style={{ color: "#8A8A78" }} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8A8A78" }}>Account Status</p>
                <p className="text-sm font-semibold mt-0.5 text-emerald-600">{user?.status || "Active"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 rounded-lg bg-[#FBFAF6] flex items-center justify-center shrink-0">
                <Calendar size={18} style={{ color: "#8A8A78" }} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8A8A78" }}>Member Since</p>
                <p className="text-sm font-semibold mt-0.5">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}