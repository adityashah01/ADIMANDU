import { useState, useEffect } from "react";
import {
  Calendar,
  Star,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { bookingsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

import StatCard from "./StatCard";

const ACCENT = {
  blue: "#3B6E8F",
  green: "#3E7C59",
  amber: "#E8A33D",
  brick: "#B24C3C",
};


const STATUS_STYLE = {
  Confirmed: { color: ACCENT.blue },
  Pending: { color: ACCENT.amber },
  Completed: { color: ACCENT.green },
};

const AVATAR_PALETTE = [ACCENT.blue, ACCENT.green, ACCENT.amber, ACCENT.brick, "#6B5B95"];

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(name) {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState([
    { title: "Today's bookings", value: "0", subtitle: "Total", icon: Calendar, accent: ACCENT.blue },
    { title: "Completed", value: "0", subtitle: "Total", icon: Star, accent: ACCENT.amber },
    { title: "Pending requests", value: "0", subtitle: "Need confirmation", icon: Clock, accent: ACCENT.brick },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await bookingsApi.getProviderBookings();
        
        // Compute stats
        const pending = data.filter(b => b.status === "PENDING").length;
        const completed = data.filter(b => b.status === "COMPLETED").length;
        const totalEarnings = data.filter(b => b.status === "COMPLETED").reduce((sum, b) => sum + (Number(b.quotedPrice) || 0), 0);
        const todays = data.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length;

        setDashboardStats([
          { title: "Today's bookings", value: todays.toString(), subtitle: "Total", icon: Calendar, accent: ACCENT.blue },
          { title: "Completed", value: completed.toString(), subtitle: "Total", icon: Star, accent: ACCENT.amber },
          { title: "Pending requests", value: pending.toString(), subtitle: "Need confirmation", icon: Clock, accent: ACCENT.brick },
        ]);

        // Map recent bookings
        const recent = data.slice(0, 4).map(b => {
          let status = "Pending";
          if (b.status === "CONFIRMED") status = "Confirmed";
          if (b.status === "COMPLETED") status = "Completed";
          if (b.status === "CANCELLED") status = "Cancelled";
          
          return {
            id: b.id,
            name: b.customer?.name || b.contactName,
            service: b.serviceName,
            amount: `Rs. ${Number(b.quotedPrice).toLocaleString()}`,
            status: status
          };
        });
        setRecentBookings(recent);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    loadData();
  }, []);
  return (
    <div className="min-h-screen font-body" style={{ background: "#F6F3EC", color: "#20261F" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-4xl font-semibold">
              Good morning, {user?.name?.split(' ')[0] || "Provider"}
            </h1>
            <p className="mt-1" style={{ color: "#6B6B63" }}>
              Here's what's happening on the board today.
            </p>
          </div>

          <Link
            to="/provider/bookings"
            className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition hover:opacity-90"
            style={{ background: "#20261F" }}
          >
            View all jobs
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2 mb-8">
          {dashboardStats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              icon={item.icon}
              accent={item.accent}
            />
          ))}
        </div>

        {/* Recent Bookings — full width now */}
        <div className="rounded-xl p-6 bg-white" style={{ border: "1px solid #E7E2D4" }}>
            <h2 className="font-display text-xl font-semibold mb-5">
              Recent bookings
            </h2>

            <div className="space-y-4">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="pb-4"
                  style={{ borderBottom: "1px solid #EFEBDF" }}
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold font-display shrink-0"
                        style={{ background: avatarColor(booking.name) }}
                      >
                        {initials(booking.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{booking.name}</h3>
                        <p className="text-xs" style={{ color: "#8A8A78" }}>
                          {booking.service}
                        </p>
                      </div>
                    </div>

                    <span
                      className="flex items-center gap-1.5 text-xs font-semibold h-fit shrink-0"
                      style={{ color: STATUS_STYLE[booking.status]?.color || ACCENT.brick }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_STYLE[booking.status]?.color || ACCENT.brick }}
                      />
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex justify-between mt-3 pl-[52px]">
                    <span className="text-sm font-medium">{booking.amount}</span>
                    <Link
                      to="/provider/bookings"
                      className="text-sm font-semibold hover:underline"
                      style={{ color: "#20261F" }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-center py-4" style={{ color: "#8A8A78" }}>
                  No recent bookings.
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}