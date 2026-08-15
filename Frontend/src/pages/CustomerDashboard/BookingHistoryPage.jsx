import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardList, Calendar, Clock, MapPin, ChevronRight,
    CheckCircle, XCircle, Loader, Star, Plus, Sparkles, Bell
} from 'lucide-react';
import { bookingsApi, serviceRequestsApi, reviewsApi } from '../../services/api';
import QuickBookModal from '../../components/CustomerPage/QuickBookModal';

const statusConfig = {
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    consultation: { label: 'Consultation', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    inspection_requested: { label: 'Inspection Requested', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    inspection_scheduled: { label: 'Inspection Scheduled', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: Calendar },
    inspection_completed: { label: 'Inspection Done', cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle },
    quote_sent: { label: 'Quote Received', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: ClipboardList },
    quote_accepted: { label: 'Quote Accepted', cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    quote_rejected: { label: 'Quote Rejected', cls: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    confirmed: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
    in_progress: { label: 'In Progress', cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: Loader },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

function filterBookings(list, tab) {
    if (tab === 'upcoming') return list.filter((b) => !['completed', 'cancelled', 'quote_rejected'].includes(b.status));
    if (tab === 'completed') return list.filter((b) => b.status === 'completed');
    if (tab === 'cancelled') return list.filter((b) => b.status === 'cancelled');
    return list;
}

export default function BookingHistoryPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [reviewOpen, setReviewOpen] = useState(null);
    const [ratings, setRatings] = useState({});
    const [reviewTexts, setReviewTexts] = useState({});
    const [submittingReview, setSubmittingReview] = useState(false);
    const [submitted, setSubmitted] = useState(new Set());
    const [showBookModal, setShowBookModal] = useState(false);
    
    const [cancelModalOpen, setCancelModalOpen] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // FEATURE 3 & 4: Escrow Timeline & Invoice Generator States
    const [selectedTrackingBooking, setSelectedTrackingBooking] = useState(null);
    const [escrowStage, setEscrowStage] = useState(1); // 1: Deposited, 2: Work Started, 3: Work Completed, 4: Fund Released
    const [invoiceMaterialCost, setInvoiceMaterialCost] = useState(350); // Editable material cost simulation

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const [bData, rData] = await Promise.all([
                bookingsApi.getCustomerBookings(),
                serviceRequestsApi.getCustomerRequests()
            ]);
            
            const normalizedBookings = bData.map(b => ({
                id: b.id,
                isRequest: false,
                providerId: b.providerId,
                providerName: b.provider.user.name,
                providerAvatar: b.provider.user.avatarUrl,
                service: b.serviceName,
                date: b.scheduledDate,
                time: b.timeSlot,
                address: b.address,
                status: b.status.toLowerCase(),
                price: b.quotedPrice || 0,
                priceType: b.provider.priceType,
                notes: b.notes,
                createdAt: b.createdAt
            }));

            const normalizedRequests = rData.map(r => ({
                id: r.id,
                isRequest: true,
                providerId: r.providerId,
                providerName: r.provider.user.name,
                providerAvatar: r.provider.user.avatarUrl,
                service: r.serviceName,
                date: r.inspection?.scheduledDate || r.createdAt,
                time: r.inspection?.scheduledTime || 'TBD',
                address: r.address,
                status: r.status.toLowerCase(),
                price: r.finalAmount || r.inspectionFee || 0,
                priceType: 'INSPECTION_BASED',
                notes: r.description,
                createdAt: r.createdAt
            }));

            const combined = [...normalizedBookings, ...normalizedRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(combined);
        } catch (error) {
            console.error("Failed to load bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id, isRequest) => {
        try {
            if (isRequest) {
                await serviceRequestsApi.cancel(id, cancelReason);
            } else {
                await bookingsApi.cancel(id, cancelReason);
            }
            setCancelModalOpen(null);
            setCancelReason('');
            fetchBookings();
        } catch (error) {
            console.error("Failed to cancel:", error);
            alert("Failed to cancel booking. Please try again.");
        }
    };

    const handleSubmitReview = async (bookingId) => {
        const rating = ratings[bookingId];
        const comment = reviewTexts[bookingId] || '';
        if (!rating) return;
        try {
            setSubmittingReview(true);
            await reviewsApi.create(bookingId, { rating, comment });
            setSubmitted((s) => new Set(s).add(bookingId));
            setReviewOpen(null);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. You may have already reviewed this booking.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const filtered = filterBookings(bookings, activeTab);
    const counts = {
        all: bookings.length,
        upcoming: bookings.filter((b) => !['completed', 'cancelled', 'quote_rejected'].includes(b.status)).length,
        completed: bookings.filter((b) => b.status === 'completed').length,
        cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Quick Book button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <ClipboardList className="w-5 h-5 text-white" />
                            </div>
                            My Bookings
                        </h1>
                        <p className="text-slate-500 mt-1 ml-14">Track and manage all your service bookings</p>
                    </div>
                    <button
                        onClick={() => setShowBookModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Book New Service
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: bookings.length, color: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200', icon: ClipboardList },
                        { label: 'Upcoming', value: counts.upcoming, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-white', border: 'border-blue-200', icon: Clock },
                        { label: 'Completed', value: counts.completed, color: 'text-green-600', bg: 'bg-gradient-to-br from-green-50 to-white', border: 'border-green-200', icon: CheckCircle },
                        { label: 'Cancelled', value: counts.cancelled, color: 'text-red-600', bg: 'bg-gradient-to-br from-red-50 to-white', border: 'border-red-200', icon: XCircle },
                    ].map((s) => (
                        <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow`}>
                            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2 opacity-60`} />
                            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                    <div className="flex border-b border-slate-200 overflow-x-auto">
                        {tabs.map((t) => (
                            <button key={t.value} onClick={() => setActiveTab(t.value)}
                                className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === t.value
                                    ? 'text-blue-600 bg-blue-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {t.label}
                                {counts[t.value] > 0 && (
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${activeTab === t.value ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                        }`}>{counts[t.value]}</span>
                                )}
                                {activeTab === t.value && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Booking List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="p-5 space-y-4">
                            {filtered.map((booking) => {
                                const status = statusConfig[booking.status];
                                const StatusIcon = status.icon;
                                const isCompleted = booking.status === 'completed';
                                const hasReviewed = submitted.has(booking.id);
                                const isReviewOpen = reviewOpen === booking.id;

                                return (
                                    <div key={booking.id} className="bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-5">
                                            <div className="flex items-start gap-4">
                                                <img src={booking.providerAvatar} alt={booking.providerName} className="w-14 h-14 rounded-xl object-cover shrink-0 border-2 border-white shadow-sm" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 text-lg">{booking.service}</h3>
                                                            <p className="text-sm text-slate-500">by <span className="font-medium text-blue-600">{booking.providerName}</span></p>
                                                        </div>
                                                        <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${status.cls}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-500">
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
                                                            <Calendar className="w-4 h-4 text-blue-500" />
                                                            {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
                                                            <Clock className="w-4 h-4 text-green-500" /> {booking.time}
                                                        </span>
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
                                                            <MapPin className="w-4 h-4 text-red-400" /> {booking.address}
                                                        </span>
                                                    </div>

                                                    {booking.notes && (
                                                        <div className="mt-2 text-xs text-slate-500 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                                                            <Sparkles className="w-3 h-3 inline mr-1 text-blue-400" />
                                                            "{booking.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Required Banner for Quote Received */}
                                            {booking.status === 'quote_sent' && (
                                                <Link
                                                    to={`/customer/service-requests/${booking.id}`}
                                                    className="mt-4 flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                                                >
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                                                    </span>
                                                    <Bell className="w-4 h-4 text-indigo-600" />
                                                    <span className="text-sm font-semibold text-indigo-700">Action Required — Quote received! Click to review & accept/reject</span>
                                                    <ChevronRight className="w-4 h-4 text-indigo-500 ml-auto" />
                                                </Link>
                                            )}

                                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-2">
                                                <div>
                                                    <span className="font-bold text-lg text-slate-800">Rs. {Number(booking.price).toLocaleString()}</span>
                                                    {booking.priceType === 'INSPECTION' && (
                                                        <span className="text-xs text-amber-600 ml-1 bg-amber-50 px-2 py-0.5 rounded-full">(inspection fee)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {isCompleted && !hasReviewed && (
                                                        <button onClick={() => setReviewOpen(isReviewOpen ? null : booking.id)}
                                                            className="flex items-center gap-1.5 px-4 py-2 border border-amber-300 text-amber-700 rounded-xl text-xs font-medium hover:bg-amber-50 transition-colors"
                                                        >
                                                            <Star className="w-3.5 h-3.5" /> Rate Service
                                                        </button>
                                                    )}
                                                    {isCompleted && hasReviewed && (
                                                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-xl">
                                                            <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                                                        </span>
                                                    )}
                                                    {!isCompleted && booking.status !== 'cancelled' && (
                                                        <button 
                                                            onClick={() => setCancelModalOpen(booking)}
                                                            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Cancel
                                                        </button>
                                                    )}
                                                    <Link to={`/providers/${booking.providerId}`}
                                                        className="flex items-center gap-1 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-50 transition-colors shadow-sm"
                                                    >
                                                        View Provider
                                                    </Link>
                                                    <Link to={booking.isRequest ? `/customer/service-requests/${booking.id}` : `/customer/bookings/${booking.id}`}
                                                        className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                                                    >
                                                        View Details <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTrackingBooking(booking);
                                                            if (booking.status === 'completed') {
                                                                setEscrowStage(4);
                                                            } else if (booking.status === 'in_progress') {
                                                                setEscrowStage(3);
                                                            } else {
                                                                setEscrowStage(1);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                                                    >
                                                        🛡️ Escrow & Receipt
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {isReviewOpen && !hasReviewed && (
                                            <div className="border-t border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
                                                <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-amber-500" />
                                                    Rate your experience
                                                </h4>
                                                <div className="flex items-center gap-1 mb-3">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <button key={n} onClick={() => setRatings((r) => ({ ...r, [booking.id]: n }))}
                                                            className="transition-transform hover:scale-110"
                                                        >
                                                            <Star className={`w-8 h-8 ${(ratings[booking.id] || 0) >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                                        </button>
                                                    ))}
                                                    {ratings[booking.id] && (
                                                        <span className="ml-2 text-sm text-slate-600 font-medium">
                                                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][ratings[booking.id]]}
                                                        </span>
                                                    )}
                                                </div>
                                                <textarea 
                                                    placeholder="Share your experience (optional)" 
                                                    rows={2}
                                                    value={reviewTexts[booking.id] || ""}
                                                    onChange={(e) => setReviewTexts(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                                    className="w-full border border-amber-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 resize-none mb-3 bg-white"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSubmitReview(booking.id)}
                                                        disabled={!ratings[booking.id] || submittingReview}
                                                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {submittingReview ? (
                                                            <><Loader className="w-4 h-4 animate-spin" /> Submitting...</>
                                                        ) : (
                                                            "Submit Review"
                                                        )}
                                                    </button>
                                                    <button onClick={() => setReviewOpen(null)}
                                                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:border-slate-400 transition-colors bg-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardList className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">No bookings here</h3>
                            <p className="text-slate-400 mb-6">You don't have any {activeTab !== 'all' ? activeTab : ''} bookings yet.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setShowBookModal(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                                >
                                    <Plus className="w-4 h-4" />
                                    Book a Service
                                </button>
                                <Link to="/dashboard/search" className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:border-slate-400 transition-colors">
                                    Browse Providers <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <QuickBookModal
                isOpen={showBookModal}
                onClose={() => setShowBookModal(false)}
                onBookingComplete={fetchBookings}
            />

            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Cancel Booking</h3>
                        <p className="text-slate-600 mb-4 text-sm">Are you sure you want to cancel this booking? Please provide a reason.</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation (required)"
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={3}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setCancelModalOpen(null);
                                    setCancelReason('');
                                }}
                                className="px-5 py-2.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                            >
                                Never mind
                            </button>
                            <button
                                onClick={() => handleCancel(cancelModalOpen.id, cancelModalOpen.isRequest)}
                                disabled={!cancelReason.trim()}
                                className="px-5 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FEATURES 3 & 4: Secure Escrow and Invoice Modal */}
            {selectedTrackingBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-extrabold flex items-center gap-2">
                                    <span>🛡️ Secure Escrow & Bill Invoice</span>
                                    <span className="text-[10px] bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Adimandu SafePay</span>
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    Booking ID: #{selectedTrackingBooking.id.substring ? selectedTrackingBooking.id.substring(0, 8) : selectedTrackingBooking.id} • {selectedTrackingBooking.service}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTrackingBooking(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Interactive Tabs inside Modal */}
                        <div className="border-b border-slate-200 flex bg-slate-50">
                            <button
                                onClick={() => setEscrowStage(prev => prev > 0 ? prev : 1)}
                                className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
                                    escrowStage > 0
                                        ? "border-red-600 text-red-600"
                                        : "border-transparent text-slate-500"
                                }`}
                            >
                                🛡️ Escrow Milestone Timeline
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 space-y-6">
                            {/* Feature 3: Escrow Timeline Tracker */}
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                        🔒
                                    </div>
                                    <div className="text-xs text-slate-600 font-medium">
                                        <p className="font-extrabold text-slate-800 text-sm">Adimandu SafePay Escrow System</p>
                                        <p className="mt-0.5">Your payment is held safely in our non-custodial escrow account. Payout is only dispatched to <span className="font-bold text-indigo-700">{selectedTrackingBooking.providerName}</span> once you confirm completion.</p>
                                    </div>
                                </div>

                                {/* Milestone Stepper */}
                                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                    {[
                                        { stage: 1, label: "Fund Deposited (भुक्तानी दाखिला)", desc: "Customer deposited Rs. " + Number(selectedTrackingBooking.price).toLocaleString() + " into Adimandu Escrow Account.", icon: "💰" },
                                        { stage: 2, label: "Job Dispatched (काम सुरु)", desc: "Expert " + selectedTrackingBooking.providerName + " accepted job, locked scheduled date, and arrived on-site.", icon: "🛵" },
                                        { stage: 3, label: "Quality Audit (गुणस्तर जाँच)", desc: "Expert completed the service. Waiting for customer approval of standard quality.", icon: "🛠️" },
                                        { stage: 4, label: "Payout Disbursed (भुक्तानी फुकुवा)", desc: "Customer approved completion. Escrow released Rs. " + Number(selectedTrackingBooking.price).toLocaleString() + " to Expert's bank/eSewa.", icon: "🎉" }
                                    ].map((step) => {
                                        const isDone = escrowStage >= step.stage;
                                        const isCurrent = escrowStage === step.stage;
                                        return (
                                            <div key={step.stage} className="relative flex gap-4 items-start">
                                                {/* Node Circle */}
                                                <div className={`absolute -left-6 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 transition ${
                                                    isDone
                                                        ? "bg-emerald-600 border-emerald-600 text-white font-black"
                                                        : "bg-white border-slate-300 text-slate-400"
                                                }`}>
                                                    {isDone ? "✓" : step.stage}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${
                                                        isCurrent ? "text-indigo-600" : isDone ? "text-slate-800" : "text-slate-400"
                                                    }`}>
                                                        <span>{step.icon} {step.label}</span>
                                                        {isCurrent && (
                                                            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black animate-pulse">CURRENT ACTIVE</span>
                                                        )}
                                                    </h4>
                                                    <p className={`text-[11px] mt-0.5 font-semibold ${isDone ? "text-slate-500" : "text-slate-300"}`}>
                                                        {step.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Simulator Control Button */}
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-extrabold text-slate-800">Milestone Simulation Controls</p>
                                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Test real-time escrow stage transitions dynamically!</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {escrowStage < 4 ? (
                                            <button
                                                type="button"
                                                onClick={() => setEscrowStage(prev => prev + 1)}
                                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                                            >
                                                {escrowStage === 3 ? "Confirm & Release payout ✓" : "Simulate Next Step →"}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-emerald-700 font-extrabold bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                                                ✓ Escrow Fully Completed & Disbursed
                                            </span>
                                        )}
                                        {escrowStage > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setEscrowStage(1)}
                                                className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 transition cursor-pointer"
                                            >
                                                Reset Simulator
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Feature 4: Interactive Professional Invoice Builder */}
                            <div className="space-y-4">
                                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                    <span>📄 Adimandu Digital Receipt Invoice (कर बीजक)</span>
                                </h3>

                                {/* Materials Cost editor input */}
                                <div className="flex items-center gap-2 justify-between bg-amber-50 border border-amber-200/50 p-3 rounded-2xl">
                                    <div className="text-xs text-amber-900">
                                        <p className="font-extrabold">Material / Spare Parts Cost Simulator:</p>
                                        <p className="text-[10px] text-amber-700 mt-0.5">Enter materials used during job to update invoice real-time.</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-slate-500">Rs.</span>
                                        <input
                                            type="number"
                                            value={invoiceMaterialCost}
                                            onChange={(e) => setInvoiceMaterialCost(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-24 p-1.5 border border-amber-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                {/* Invoice Layout Box */}
                                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 text-xs font-mono text-slate-700 shadow-inner">
                                    <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-3">
                                        <div>
                                            <p className="font-extrabold text-sm text-slate-900">ADIMANDU SERVICES</p>
                                            <p className="text-[9px] text-slate-500 font-sans mt-0.5">Patan, Lalitpur, Nepal • PAN: 615284920</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-slate-900">INVOICE</p>
                                            <p className="text-[9px] text-slate-500">No: ADI-INV-89574</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] pb-3 border-b border-dashed border-slate-200 font-sans">
                                        <div>
                                            <p className="text-slate-400 uppercase font-bold tracking-wider">Bill To:</p>
                                            <p className="font-bold text-slate-800">Valued Adimandu Customer</p>
                                            <p className="text-slate-500">{selectedTrackingBooking.address}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 uppercase font-bold tracking-wider">Service Professional:</p>
                                            <p className="font-bold text-slate-800">{selectedTrackingBooking.providerName}</p>
                                            <p className="text-slate-500">Status: {selectedTrackingBooking.status}</p>
                                        </div>
                                    </div>

                                    {/* Itemized charges table */}
                                    <div className="space-y-2 font-mono">
                                        <div className="flex justify-between font-bold text-slate-900 pb-1 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                                            <span>Service Item Description</span>
                                            <span>Amount</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>1. Base Service / Inspection (Diagnostic)</span>
                                            <span>Rs. {Number(selectedTrackingBooking.price).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>2. Materials & Spare Parts (Genuine Sourced)</span>
                                            <span>Rs. {Number(invoiceMaterialCost).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>3. Escrow Transaction Fee (5%)</span>
                                            <span>Rs. {Math.round(selectedTrackingBooking.price * 0.05).toLocaleString()}</span>
                                        </div>

                                        {/* Subtotal line */}
                                        {(() => {
                                            const serviceCharge = Number(selectedTrackingBooking.price);
                                            const escrowFee = Math.round(serviceCharge * 0.05);
                                            const subtotal = serviceCharge + invoiceMaterialCost + escrowFee;
                                            const vatAmount = Math.round(subtotal * 0.13);
                                            const grandTotal = subtotal + vatAmount;

                                            return (
                                                <div className="pt-3 border-t border-dashed border-slate-200 space-y-1.5 font-bold text-slate-800">
                                                    <div className="flex justify-between">
                                                        <span>Taxable Subtotal (जम्मा मूल्य):</span>
                                                        <span>Rs. {subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-600 font-semibold">
                                                        <span>VAT (१३% मूल्य अभिबृद्धि कर):</span>
                                                        <span>Rs. {vatAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-base font-black text-slate-950 pt-1.5 border-t border-slate-300">
                                                        <span>Grand Total (कुल जम्मा):</span>
                                                        <span>Rs. {grandTotal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="text-center font-sans text-[9px] text-slate-400 pt-3 border-t border-dashed border-slate-200">
                                        <p>Dhanyabaad for choosing Adimandu! This is an electronically generated valid tax invoice.</p>
                                    </div>
                                </div>

                                {/* Printable trigger button */}
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.print();
                                        }}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        Print / Save Invoice Receipt 🖨️
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-4 border-t border-slate-100 text-right">
                            <button
                                onClick={() => setSelectedTrackingBooking(null)}
                                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
