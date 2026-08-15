import { useState, useEffect } from "react";
import { Wallet, TrendingUp, Clock3, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "./StatCard";
import { transactionsApi, authApi } from "../../services/api";

const AVATAR_PALETTE = ["#3B6E8F", "#3E7C59", "#E8A33D", "#B24C3C", "#6B5B95"];

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
}

function avatarColor(name = "") {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildChartData(transactions) {
  // Group PROVIDER_EARNING by month (current year)
  const now = new Date();
  const year = now.getFullYear();
  const monthly = {};

  transactions
    .filter((t) => t.type === "PROVIDER_EARNING" && t.status === "COMPLETED")
    .forEach((t) => {
      const d = new Date(t.createdAt);
      if (d.getFullYear() !== year) return;
      const key = d.getMonth(); // 0-11
      monthly[key] = (monthly[key] || 0) + Number(t.amount);
    });

  // Build array up to current month
  return Array.from({ length: now.getMonth() + 1 }, (_, i) => ({
    month: MONTH_LABELS[i],
    amount: Math.round(monthly[i] || 0),
  }));
}

export default function Earnings() {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [txnData, userData] = await Promise.all([
          transactionsApi.getProviderTransactions(),
          authApi.me()
        ]);
        setTransactions(Array.isArray(txnData) ? txnData : []);
        setWallet(Number(userData?.user?.providerProfile?.walletBalance || 0));
        setEarnings(Number(userData?.user?.providerProfile?.totalEarnings || 0));
      } catch (err) {
        console.error("Failed to load earnings data:", err);
        setError("Could not load earnings data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── derived stats ──────────────────────────────────────────────────────────
  const earningTxns = transactions.filter(
    (t) => t.type === "PROVIDER_EARNING" && t.status === "COMPLETED"
  );

  const totalEarnings = earningTxns.reduce((sum, t) => sum + Number(t.amount), 0);

  const now = new Date();
  const thisMonthEarnings = earningTxns
    .filter((t) => {
      const d = new Date(t.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const thisMonthCount = earningTxns.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Pending = escrow-held service payments not yet released
  const pendingTxns = transactions.filter(
    (t) => t.type === "SERVICE_PAYMENT" && t.status === "PENDING"
  );
  const pendingAmount = pendingTxns.reduce((sum, t) => sum + Number(t.amount), 0);

  const chartData = buildChartData(transactions);

  // Recent payments — last 10 PROVIDER_EARNING entries
  const recentPayments = [...earningTxns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 font-body" style={{ color: "#20261F" }}>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest" style={{ color: "#8A8A78" }}>
          Money
        </span>
        <h1 className="font-display text-3xl font-semibold mt-1">Earnings</h1>
        <p className="mt-1" style={{ color: "#6B6B63" }}>
          Track what's coming in and what's still owed.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Earnings"
          value={loading ? "—" : `Rs. ${earnings.toLocaleString("en-IN")}`}
          subtitle="All time actual earnings"
          icon={TrendingUp}
          accent="#3B6E8F"
        />
        <StatCard
          title="Sewa Wallet Balance"
          value={loading ? "—" : `Rs. ${wallet.toLocaleString("en-IN")}`}
          subtitle={wallet < 0 ? "You have a due amount" : "Current cleared balance"}
          icon={Wallet}
          accent={wallet < 0 ? "#B24C3C" : "#3E7C59"}
        />
        <StatCard
          title="Pending (Escrow)"
          value={loading ? "—" : `Rs. ${pendingAmount.toLocaleString("en-IN")}`}
          subtitle={`${pendingTxns.length} online payment${pendingTxns.length !== 1 ? "s" : ""} pending release`}
          icon={Clock3}
          accent="#E8A33D"
        />
      </div>

      {wallet < 0 && (
        <div className="mb-8 p-5 rounded-xl border border-red-200 bg-red-50 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-semibold text-red-800 text-lg">Due Commission Outstanding</h3>
            <p className="text-red-700 text-sm mt-1">
              Your wallet balance is negative because you have collected cash for recent jobs, and the platform commission is pending. 
              This due amount (<strong>Rs. {Math.abs(wallet).toLocaleString("en-IN")}</strong>) will be automatically deducted from your future online Khalti payments.
            </p>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E7E2D4" }}>
        <h2 className="font-display text-xl font-semibold mb-5">Recent payments</h2>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentPayments.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "#8A8A78" }}>
            No payment records yet. Completed bookings will appear here.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#EFEBDF" }}>
            {recentPayments.map((t) => {
              const label = t.description || "Service payment";
              const dateStr = new Date(t.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const refLabel = t.bookingId
                ? `Booking #${t.bookingId.slice(0, 8)}`
                : t.serviceRequestId
                ? `Request #${t.serviceRequestId.slice(0, 8)}`
                : "Service";

              return (
                <div key={t.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold font-display shrink-0"
                      style={{ background: avatarColor(refLabel) }}
                    >
                      {initials(refLabel)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{refLabel}</p>
                      <p className="text-xs" style={{ color: "#8A8A78" }}>
                        {label}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-sm" style={{ color: "#3E7C59" }}>
                      + Rs. {Number(t.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs" style={{ color: "#8A8A78" }}>
                      {dateStr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}