import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Loader, BellOff } from "lucide-react";
import { notificationsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const TYPE_STYLES = {
    BOOKING: { dot: "bg-blue-500", label: "Booking" },
    PAYMENT: { dot: "bg-green-500", label: "Payment" },
    REVIEW: { dot: "bg-yellow-400", label: "Review" },
    SYSTEM: { dot: "bg-slate-400", label: "System" },
    PROMOTION: { dot: "bg-purple-500", label: "Promo" },
};

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationButton() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const ref = useRef(null);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Fetch when opened
    useEffect(() => {
        if (!open || !user) return;
        setLoading(true);
        notificationsApi
            .getAll()
            .then(setNotifications)
            .catch(() => setNotifications([]))
            .finally(() => setLoading(false));
    }, [open, user]);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationsApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch { /* silent */ }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationsApi.delete(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch { /* silent */ }
    };

    const handleMarkAll = async () => {
        setMarkingAll(true);
        try {
            await notificationsApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch { /* silent */ }
        finally { setMarkingAll(false); }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition text-slate-700"
                aria-label="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">{unreadCount} unread</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    disabled={markingAll}
                                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    {markingAll
                                        ? <Loader size={12} className="animate-spin" />
                                        : <CheckCheck size={13} />
                                    }
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[420px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-14">
                                <Loader size={22} className="animate-spin text-blue-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                    <BellOff size={22} className="text-slate-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                                <p className="text-xs text-slate-400 mt-1">We'll notify you about bookings and updates</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((n) => {
                                    const style = TYPE_STYLES[n.type] || TYPE_STYLES.SYSTEM;
                                    return (
                                        <li
                                            key={n.id}
                                            className={`flex items-start gap-3 px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group ${!n.isRead ? "bg-blue-50/40" : ""}`}
                                        >
                                            {/* Type dot */}
                                            <div className="mt-1.5 shrink-0">
                                                <span className={`w-2.5 h-2.5 rounded-full ${style.dot} inline-block`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                                <span className={`inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${style.dot} bg-opacity-10 text-slate-600`}>
                                                    {style.label}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(n.id, e)}
                                                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 transition"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={13} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(n.id, e)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400">{notifications.length} total notification{notifications.length !== 1 ? "s" : ""}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationButton;