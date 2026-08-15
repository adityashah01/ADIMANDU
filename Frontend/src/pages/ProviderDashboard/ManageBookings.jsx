import { useState, useMemo, useEffect } from "react";
import {
  Search,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  ClipboardList,
  ChevronRight,
  X,
} from "lucide-react";
import { bookingsApi } from "../../services/api";

const STATUS_STYLE = {
  Pending: {
    tab: "bg-[#E8A33D]",
    stamp: "text-[#8A5A15] border-[#E8A33D]",
    dot: "bg-[#E8A33D]",
  },
  Confirmed: {
    tab: "bg-[#3B6E8F]",
    stamp: "text-[#3B6E8F] border-[#3B6E8F]",
    dot: "bg-[#3B6E8F]",
  },
  Completed: {
    tab: "bg-[#3E7C59]",
    stamp: "text-[#3E7C59] border-[#3E7C59]",
    dot: "bg-[#3E7C59]",
  },
  Cancelled: {
    tab: "bg-[#B24C3C]",
    stamp: "text-[#B24C3C] border-[#B24C3C]",
    dot: "bg-[#B24C3C]",
  },
};

const AVATAR_PALETTE = ["#3B6E8F", "#3E7C59", "#E8A33D", "#B24C3C", "#6B5B95"];

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name) {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

function formatRs(n) {
  return "Rs. " + n.toLocaleString("en-IN");
}

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function ManageBookings() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await bookingsApi.getProviderBookings();
      const mapped = data.map(b => {
        let status = "Pending";
        if (b.status === "CONFIRMED") status = "Confirmed";
        if (b.status === "COMPLETED") status = "Completed";
        if (b.status === "CANCELLED") status = "Cancelled";

        return {
          id: b.id,
          ticket: b.bookingNumber,
          customer: b.customer?.name || b.contactName || "Unknown",
          service: b.serviceName || "Service",
          date: new Date(b.scheduledDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', ' + b.timeSlot,
          amount: b.quotedPrice || 0,
          status: status,
          paymentMethod: b.paymentMethod || 'Not specified',
          paymentStatus: b.paymentStatus || 'UNPAID',
          raw: b
        };
      });
      setBookings(mapped);
    } catch (error) {
      console.error("Failed to load provider bookings:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(true);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    // Optimistic UI Update
    const mappedNewStatus = newStatus === 'CONFIRMED' ? 'Confirmed' : 
                            newStatus === 'COMPLETED' ? 'Completed' : 
                            newStatus === 'CANCELLED' ? 'Cancelled' : 'Pending';

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: mappedNewStatus } : b));
    if (selected && selected.id === id) {
      setSelected(prev => ({ ...prev, status: mappedNewStatus }));
    }

    try {
      await bookingsApi.updateStatus(id, newStatus);
      fetchBookings(false); // Refresh silently in background
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update booking status.");
      fetchBookings(false); // Rollback on error
    }
  };

  const handleUpdatePaymentStatus = async (id, paymentStatus) => {
    // Optimistic UI Update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus } : b));
    if (selected && selected.id === id) {
      setSelected(prev => ({ ...prev, paymentStatus }));
    }

    try {
      await bookingsApi.updatePaymentStatus(id, paymentStatus);
      fetchBookings(false); // Refresh silently in background
    } catch (error) {
      console.error("Failed to update payment status:", error);
      alert("Failed to update payment status.");
      fetchBookings(false); // Rollback on error
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const customerName = booking.customer || "";
      const serviceName = booking.service || "";
      
      const matchSearch =
        customerName.toLowerCase().includes(search.toLowerCase()) ||
        serviceName.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "All" || booking.status === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter, bookings]);

  const counts = {
    Total: bookings.length,
    Pending: bookings.filter((b) => b.status === "Pending").length,
    Completed: bookings.filter((b) => b.status === "Completed").length,
    Cancelled: bookings.filter((b) => b.status === "Cancelled").length,
  };

  return (
    <div
      className="min-h-screen p-6 md:p-10"
      style={{ background: "#F6F3EC", color: "#20261F" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
        .stamp {
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.06em;
          transform: rotate(-3deg);
        }
      `}</style>

      <div className="max-w-6xl mx-auto font-body">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={18} style={{ color: "#8A8A78" }} />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "#8A8A78" }}
              >
                Work order desk
              </span>
            </div>
            <h1 className="font-display text-4xl font-semibold">
              Manage Bookings
            </h1>
            <p className="mt-1" style={{ color: "#6B6B63" }}>
              Every job that's come through the board, in one place.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total bookings",
              value: counts.Total,
              icon: CalendarDays,
              accent: "#3B6E8F",
            },
            {
              label: "Pending",
              value: counts.Pending,
              icon: Clock3,
              accent: "#E8A33D",
            },
            {
              label: "Completed",
              value: counts.Completed,
              icon: CheckCircle2,
              accent: "#3E7C59",
            },
            {
              label: "Cancelled",
              value: counts.Cancelled,
              icon: XCircle,
              accent: "#B24C3C",
            },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="relative rounded-xl p-5 bg-white overflow-hidden"
              style={{
                boxShadow: "0 1px 2px rgba(32,38,31,0.06)",
                border: "1px solid #E7E2D4",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: accent }}
              />
              <Icon size={20} style={{ color: accent }} className="mb-3" />
              <div className="font-display text-3xl font-semibold">
                {value}
              </div>
              <p className="text-sm mt-1" style={{ color: "#6B6B63" }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div
          className="rounded-xl bg-white p-5 mb-6"
          style={{ border: "1px solid #E7E2D4" }}
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative md:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: "#9A9A8C" }}
              />
              <input
                type="text"
                placeholder="Search customer or service"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{
                  border: "1px solid #E7E2D4",
                  background: "#FBFAF6",
                }}
              />
            </div>

            <div
              className="flex gap-1 flex-wrap border-b md:border-b-0"
              style={{ borderColor: "#E7E2D4" }}
            >
              {FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className="relative px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    color: filter === item ? "#20261F" : "#8A8A78",
                  }}
                >
                  {item}
                  {filter === item && (
                    <span
                      className="absolute left-2 right-2 -bottom-[1px] h-[2px] rounded-full"
                      style={{ background: "#E8A33D" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div
          className="rounded-xl bg-white overflow-hidden"
          style={{ border: "1px solid #E7E2D4" }}
        >
          <div
            className="px-6 py-4 flex items-baseline justify-between"
            style={{ borderBottom: "1px solid #E7E2D4" }}
          >
            <h2 className="font-display text-lg font-semibold">
              Booking list
            </h2>
            <span className="text-sm" style={{ color: "#8A8A78" }}>
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"}
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center flex justify-center">
              <div className="w-10 h-10 border-4 border-[#3B6E8F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <ClipboardList
                size={28}
                className="mx-auto mb-3"
                style={{ color: "#C9C4B3" }}
              />
              <p className="font-medium">No bookings match that search</p>
              <p className="text-sm mt-1" style={{ color: "#8A8A78" }}>
                Try a different name, service, or status.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#EFEBDF" }}>
              {filteredBookings.map((booking) => {
                const s = STATUS_STYLE[booking.status];
                return (
                  <div
                    key={booking.id}
                    className="flex gap-0 hover:bg-[#FBFAF6] transition-colors"
                  >
                    {/* ticket tab */}
                    <div className={`w-1.5 shrink-0 ${s.tab}`} />

                    <div className="flex-1 flex flex-col lg:flex-row justify-between gap-4 px-6 py-5">
                      {/* Left side */}
                      <div className="flex gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0 font-display"
                          style={{ background: avatarColor(booking.customer) }}
                        >
                          {initials(booking.customer)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">
                              {booking.customer}
                            </h3>
                            <span
                              className="text-xs font-mono px-1.5 py-0.5 rounded"
                              style={{
                                background: "#F1EEE3",
                                color: "#8A8A78",
                              }}
                            >
                              {booking.ticket}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: "#6B6B63" }}>
                            {booking.service}
                          </p>
                          <div
                            className="flex flex-wrap gap-4 mt-2 text-sm"
                            style={{ color: "#8A8A78" }}
                          >
                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              {booking.date}
                            </span>
                            <span className="font-medium" style={{ color: "#20261F" }}>
                              {formatRs(booking.amount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3">
                        <span
                          className={`stamp text-xs font-semibold uppercase px-3 py-1 rounded border-2 border-dashed ${s.stamp}`}
                        >
                          {booking.status}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelected(booking)}
                            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                            style={{
                              background: "#F1EEE3",
                              color: "#20261F",
                            }}
                          >
                            View
                            <ChevronRight size={14} />
                          </button>

                          {booking.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                                style={{ background: "#3E7C59" }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "CANCELLED")}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                                style={{ background: "#B24C3C" }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {booking.status === "Confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "COMPLETED")}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                              style={{ background: "#3B6E8F" }}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(32,38,31,0.4)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl max-w-sm w-full p-6 font-body relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4"
              style={{ color: "#8A8A78" }}
            >
              <X size={18} />
            </button>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: "#F1EEE3", color: "#8A8A78" }}
            >
              {selected.ticket}
            </span>
            <h3 className="font-display text-2xl font-semibold mt-3">
              {selected.customer}
            </h3>
            <p style={{ color: "#6B6B63" }}>{selected.service}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#8A8A78" }}>Scheduled</span>
                <span className="font-medium">{selected.date}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#8A8A78" }}>Amount</span>
                <span className="font-medium">{formatRs(selected.amount)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span style={{ color: "#8A8A78" }}>Payment</span>
                <div className="text-right">
                  <div className="font-medium capitalize">
                    {selected.paymentMethod === 'KHALTI' ? 'Khalti Online' : selected.paymentMethod}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: selected.paymentStatus === 'ESCROW_HELD' || selected.paymentStatus === 'RELEASED' ? '#3E7C59' : '#E8A33D' }}>
                    {selected.paymentStatus.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t" style={{ borderColor: "#E7E2D4" }}>
                <span style={{ color: "#8A8A78" }}>Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`stamp text-xs font-semibold uppercase px-2 py-0.5 rounded border-2 border-dashed ${STATUS_STYLE[selected.status].stamp}`}
                  >
                    {selected.status}
                  </span>
                  {selected.raw.customerConfirmedAt && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold" title="Customer Confirmed">✓ C.C.</span>
                  )}
                </div>
              </div>
              {selected.status === 'Completed' && selected.raw.customerConfirmedAt && selected.paymentMethod === 'CASH' && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed" style={{ borderColor: "#E7E2D4" }}>
                  <span className="font-semibold text-xs" style={{ color: "#20261F" }}>Update Payment</span>
                  <select
                    value={selected.paymentStatus}
                    onChange={(e) => handleUpdatePaymentStatus(selected.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded border focus:outline-none"
                    style={{ borderColor: "#E7E2D4", background: "#F6F3EC", color: "#20261F" }}
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}