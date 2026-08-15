import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { CalendarDays, MapPin, Briefcase } from "lucide-react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await adminApi.getBookings();
        setBookings(data || []);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Bookings</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all service bookings across the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{b.serviceName}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3" /> <span className="truncate max-w-[150px] block">{b.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{b.customer?.name || b.contactName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {b.provider?.user?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5 text-slate-500 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(b.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="ml-5">{b.timeSlot}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
