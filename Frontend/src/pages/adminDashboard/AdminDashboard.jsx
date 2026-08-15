import { useState, useEffect } from "react";
import { Users, Briefcase, CalendarDays, ClipboardList } from "lucide-react";
import { adminApi } from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      title: "Total Providers",
      value: stats.totalProviders,
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApplications,
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your platform's overall metrics and pending activities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`rounded-2xl border ${stat.border} bg-white p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
