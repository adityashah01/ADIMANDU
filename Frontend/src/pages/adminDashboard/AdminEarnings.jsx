import { useState, useEffect } from "react";
import {
  TrendingUp, Users, Wallet, DollarSign, Search, Filter,
  ArrowUpRight, Building2, User, RefreshCw
} from "lucide-react";

const API_URL = "/api";

const apiFetch = (endpoint) =>
  fetch(`${API_URL}${endpoint}`, { credentials: "include" }).then((r) => r.json());

function Rs(n) {
  return "Rs. " + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PAYMENT_COLORS = {
  RELEASED: "bg-green-100 text-green-700",
  PAID: "bg-green-100 text-green-700",
  ESCROW_HELD: "bg-amber-100 text-amber-700",
  UNPAID: "bg-red-100 text-red-600",
  PENDING: "bg-amber-100 text-amber-700",
};

const PAYMENT_LABEL = {
  RELEASED: "Released",
  PAID: "Paid",
  ESCROW_HELD: "In Escrow",
  UNPAID: "Unpaid",
  PENDING: "Pending",
};

const METHOD_LABEL = {
  KHALTI: "Khalti Online",
  CASH: "Cash",
};

export default function AdminEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/earnings");
      setData(res);
    } catch (e) {
      console.error("Failed to load earnings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const earnings = (data?.earnings || []).filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.customer?.name?.toLowerCase().includes(q) ||
      e.customer?.email?.toLowerCase().includes(q) ||
      e.provider?.name?.toLowerCase().includes(q) ||
      e.service?.toLowerCase().includes(q);
    const matchMethod = filterMethod === "ALL" || e.paymentMethod === filterMethod;
    const matchStatus = filterStatus === "ALL" || e.paymentStatus === filterStatus;
    return matchSearch && matchMethod && matchStatus;
  });

  const summary = data?.summary || {};

  return (
    <div className="min-h-screen p-6 md:p-10 font-body" style={{ background: "#F6F3EC", color: "#20261F" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: "#20261F" }}>
              Platform Earnings
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6B6B63" }}>
              Track all customer payments, provider payouts & platform commissions
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white border"
            style={{ borderColor: "#E7E2D4", color: "#20261F" }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            {
              label: "Total Revenue",
              value: Rs(summary.totalRevenue),
              icon: TrendingUp,
              color: "#3E7C59",
              bg: "#E8F4ED",
            },
            {
              label: "Platform Commission (10%)",
              value: Rs(summary.totalPlatformFee),
              icon: DollarSign,
              color: "#B24C3C",
              bg: "#FBEEEC",
            },
            {
              label: "Provider Payouts",
              value: Rs(summary.totalProviderPayout),
              icon: Wallet,
              color: "#3B6E8F",
              bg: "#EAF2F8",
            },
            {
              label: "Total Transactions",
              value: summary.count || 0,
              icon: Users,
              color: "#6B5B95",
              bg: "#F0EDF8",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "#FFFFFF", border: "1px solid #E7E2D4" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#8A8A78" }}>{label}</p>
                <p className="text-xl font-bold font-display" style={{ color: "#20261F" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-4 mb-5 flex flex-col sm:flex-row gap-3 items-center"
          style={{ background: "#FFFFFF", border: "1px solid #E7E2D4" }}>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8A8A78" }} />
            <input
              type="text"
              placeholder="Search by customer, provider, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: "#F6F3EC", border: "1px solid #E7E2D4", color: "#20261F" }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4" style={{ color: "#8A8A78" }} />
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: "#F6F3EC", border: "1px solid #E7E2D4", color: "#20261F" }}
            >
              <option value="ALL">All Methods</option>
              <option value="KHALTI">Khalti</option>
              <option value="CASH">Cash</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: "#F6F3EC", border: "1px solid #E7E2D4", color: "#20261F" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="RELEASED">Released</option>
              <option value="PAID">Paid (Cash)</option>
              <option value="ESCROW_HELD">In Escrow</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E7E2D4" }}>
          {loading ? (
            <div className="flex justify-center py-20 bg-white">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#3B6E8F", borderTopColor: "transparent" }} />
            </div>
          ) : earnings.length === 0 ? (
            <div className="bg-white text-center py-20">
              <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: "#E7E2D4" }} />
              <p className="font-semibold" style={{ color: "#8A8A78" }}>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F1EEE3", borderBottom: "1px solid #E7E2D4" }}>
                    {["Service", "Customer", "Provider", "Method", "Total", "Commission (10%)", "Provider Gets", "Status", "Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6B6B63" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e, idx) => (
                    <tr
                      key={`${e.id}-${idx}`}
                      className="border-b transition-colors hover:bg-[#FBFAF6]"
                      style={{ borderColor: "#E7E2D4", background: "#FFFFFF" }}
                    >
                      {/* Service */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: e.type === "booking" ? "#EAF2F8" : "#F0EDF8",
                              color: e.type === "booking" ? "#3B6E8F" : "#6B5B95",
                            }}
                          >
                            {e.type === "booking" ? "Booking" : "Request"}
                          </span>
                        </div>
                        <p className="font-medium mt-1 text-xs" style={{ color: "#20261F" }}>
                          {e.service || "Service"}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "#3B6E8F" }}>
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs" style={{ color: "#20261F" }}>{e.customer?.name || "—"}</p>
                            <p className="text-xs" style={{ color: "#8A8A78" }}>{e.customer?.email || ""}</p>
                          </div>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "#3E7C59" }}>
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs" style={{ color: "#20261F" }}>{e.provider?.name || "—"}</p>
                            <p className="text-xs" style={{ color: "#8A8A78" }}>{e.provider?.email || ""}</p>
                          </div>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.paymentMethod === "KHALTI" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                          {METHOD_LABEL[e.paymentMethod] || e.paymentMethod || "—"}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4 font-bold" style={{ color: "#20261F" }}>
                        {Rs(e.totalAmount)}
                      </td>

                      {/* Platform Fee */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#B24C3C" }} />
                          <span className="font-semibold" style={{ color: "#B24C3C" }}>{Rs(e.platformFee)}</span>
                        </div>
                      </td>

                      {/* Provider Earning */}
                      <td className="px-4 py-4">
                        <span className="font-semibold" style={{ color: "#3E7C59" }}>{Rs(e.providerEarning)}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PAYMENT_COLORS[e.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                          {PAYMENT_LABEL[e.paymentStatus] || e.paymentStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs" style={{ color: "#8A8A78" }}>
                        {new Date(e.date).toLocaleDateString("en-US", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && earnings.length > 0 && (
          <p className="text-xs text-center mt-4" style={{ color: "#8A8A78" }}>
            Showing {earnings.length} transaction{earnings.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
