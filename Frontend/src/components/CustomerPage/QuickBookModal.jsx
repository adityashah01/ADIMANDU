import { useState, useEffect } from 'react';
import { X, Search, Calendar, Clock, MapPin, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { providersApi, bookingsApi } from '../../services/api';

const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
];

const serviceOptions = {
    plumbing: ['Pipe Leak Repair', 'Drain Cleaning', 'Bathroom Installation', 'Water Tank Fitting', 'Tap/Faucet Repair', 'Geyser Installation'],
    electrical: ['Wiring & Rewiring', 'Switchboard Replacement', 'Fan/Light Installation', 'CCTV Wiring', 'MCB Box Setup', 'Appliance Installation'],
    cleaning: ['Regular Home Cleaning', 'Deep Cleaning', 'Carpet & Sofa Cleaning', 'Kitchen Deep Clean', 'Office Cleaning', 'Move-in/out Cleaning'],
    tutoring: ['Mathematics Coaching', 'Physics Coaching', 'Computer Science', 'SEE Preparation', '+2 Science Coaching', 'English Grammar'],
    appliance: ['AC Servicing', 'Refrigerator Repair', 'Washing Machine Repair', 'TV Repair', 'Microwave Repair', 'Water Purifier Service'],
    carpentry: ['Custom Furniture', 'Door/Window Repair', 'Shelving & Storage', 'Furniture Polishing', 'Wooden Flooring'],
    painting: ['Interior Painting', 'Exterior Painting', 'Texture & Design', 'Waterproofing', 'Wall Putty Application'],
    mechanic: ['Bike Full Service', 'Car Full Service', 'Oil Change', 'Puncture Fix', 'Engine Tuning', 'Battery Replacement'],
};

export default function QuickBookModal({ isOpen, onClose, onBookingComplete }) {
    const [step, setStep] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [allProviders, setAllProviders] = useState([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        service: '', date: '', time: '', address: '',
        landmark: '', notes: '', contactName: '', contactPhone: '',
    });
    const [errors, setErrors] = useState({});
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loadingBookedSlots, setLoadingBookedSlots] = useState(false);

    const nepalOffset = 5.75 * 60 * 60 * 1000;
    const nowNPT = new Date(new Date().getTime() + nepalOffset);
    const today = nowNPT.toISOString().split('T')[0];

    useEffect(() => {
        if (!selectedProvider?.id || !form.date) {
            setBookedSlots([]);
            return;
        }
        let isMounted = true;
        setLoadingBookedSlots(true);
        bookingsApi.getBookedSlots(selectedProvider.id, form.date)
            .then((res) => {
                if (isMounted) {
                    setBookedSlots(res.bookedSlots || []);
                }
            })
            .catch((err) => {
                console.error("Failed to load booked slots:", err);
                if (isMounted) setBookedSlots([]);
            })
            .finally(() => {
                if (isMounted) setLoadingBookedSlots(false);
            });
        return () => { isMounted = false; };
    }, [selectedProvider?.id, form.date]);

    const filteredTimeSlots = timeSlots.filter(t => {
        if (form.date !== today) return true;
        const [time, modifier] = t.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const [y, m, d] = today.split('-').map(Number);
        const slotInNepal = new Date(Date.UTC(y, m - 1, d, hours, minutes));
        const slotInUTC = new Date(slotInNepal.getTime() - nepalOffset);
        return slotInUTC.getTime() > new Date().getTime() - (30 * 60 * 1000);
    });

    useEffect(() => {
        if (isOpen && allProviders.length === 0) {
            const loadProviders = async () => {
                setLoadingProviders(true);
                try {
                    const data = await providersApi.getAll();
                    setAllProviders(data || []);
                } catch (error) {
                    console.error("Failed to load providers:", error);
                } finally {
                    setLoadingProviders(false);
                }
            };
            loadProviders();
        }
    }, [isOpen, allProviders.length]);

    const filteredProviders = allProviders.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const availableServices = selectedProvider
        ? (serviceOptions[selectedProvider.categoryId] || selectedProvider.skills)
        : [];

    const validateStep = (s) => {
        const errs = {};
        if (s === 0 && !selectedProvider) {
            errs.provider = 'Please select a provider';
        }
        if (s === 1) {
            if (!form.service) errs.service = 'Please select a service';
            if (!form.date) errs.date = 'Please select a date';
            if (!form.time) errs.time = 'Please select a time slot';
            else if (bookedSlots.includes(form.time)) errs.time = 'This time slot is already booked. Please choose another time.';
        }
        if (s === 2) {
            if (!form.address.trim()) errs.address = 'Please enter your address';
            if (!form.contactName.trim()) errs.contactName = 'Please enter your name';
            if (!form.contactPhone.trim()) errs.contactPhone = 'Please enter your phone number';
            else if (!/^[0-9]{10}$/.test(form.contactPhone.replace(/\s/g, '')))
                errs.contactPhone = 'Enter a valid 10-digit phone number';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) setStep(step + 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        try {
            await bookingsApi.create({
                providerId: selectedProvider.id,
                serviceName: form.service,
                scheduledDate: form.date,
                timeSlot: form.time,
                address: form.address,
                landmark: form.landmark,
                notes: form.notes,
                contactName: form.contactName,
                contactPhone: form.contactPhone,
            });
            setSubmitted(true);
            setTimeout(() => {
                onBookingComplete();
                handleClose();
            }, 1500);
        } catch (error) {
            console.error("Booking submit error:", error);
            setSubmitError(error.message || "Failed to create booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(0);
        setSelectedProvider(null);
        setForm({ service: '', date: '', time: '', address: '', landmark: '', notes: '', contactName: '', contactPhone: '' });
        setErrors({});
        setSubmitted(false);
        setSearchQuery('');
        onClose();
    };

    const updateForm = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    };

    if (!isOpen) return null;

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
                    <p className="text-slate-500">Your service request has been submitted successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Quick Book Service</h2>
                        <p className="text-blue-100 text-sm">Step {step + 1} of 3</p>
                    </div>
                    <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search providers by name, category, or service..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            {errors.provider && (
                                <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.provider}</p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                                {loadingProviders ? (
                                    <div className="col-span-full flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : filteredProviders.length > 0 ? (
                                    filteredProviders.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedProvider(p)}
                                            className={`text-left p-4 rounded-xl border-2 transition-all ${selectedProvider?.id === p.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-800 truncate">{p.name}</div>
                                                    <div className="text-sm text-blue-600">{p.category}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{p.location || 'Unknown Location'}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-slate-800 text-sm">Rs. {Number(p.price).toLocaleString()}</div>
                                                    <div className="text-xs text-slate-400">{p.priceUnit}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10 text-slate-500">
                                        No providers found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 1 && selectedProvider && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                                <img src={selectedProvider.avatar} alt={selectedProvider.name} className="w-14 h-14 rounded-xl object-cover" />
                                <div>
                                    <div className="font-semibold text-slate-800">{selectedProvider.name}</div>
                                    <div className="text-sm text-blue-600">{selectedProvider.category}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Service <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableServices.map((svc) => (
                                        <button key={svc} type="button" onClick={() => updateForm('service', svc)}
                                            className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${form.service === svc ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >{svc}</button>
                                    ))}
                                </div>
                                {errors.service && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.service}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1.5" />Preferred Date <span className="text-red-500">*</span>
                                    </label>
                                    <input type="date" min={today} value={form.date} onChange={(e) => updateForm('date', e.target.value)}
                                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.date ? 'border-red-400' : 'border-slate-300 focus:border-blue-400'}`}
                                    />
                                    {errors.date && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                                        <span><Clock className="w-4 h-4 inline mr-1.5" />Time Slot <span className="text-red-500">*</span></span>
                                        {loadingBookedSlots && <span className="text-[11px] font-normal text-slate-400">Checking...</span>}
                                    </label>
                                    <select value={form.time} onChange={(e) => updateForm('time', e.target.value)}
                                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.time ? 'border-red-400' : 'border-slate-300 focus:border-blue-400'}`}
                                    >
                                        <option value="">Select time</option>
                                        {timeSlots.map((t) => {
                                            const isPast = !filteredTimeSlots.includes(t);
                                            const isBooked = bookedSlots.includes(t);
                                            const isDisabled = isPast || isBooked;
                                            return (
                                                <option key={t} value={t} disabled={isDisabled}>
                                                    {t} {isBooked ? '(Booked)' : isPast ? '(Passed)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {filteredTimeSlots.length === 0 && form.date === today && (
                                        <p className="text-xs text-red-500 mt-1">No more slots available for today.</p>
                                    )}
                                    {errors.time && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.time}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && selectedProvider && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{form.service}</div>
                                        <div className="text-sm text-slate-500">{form.date} at {form.time}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                <input type="text" value={form.contactName} onChange={(e) => updateForm('contactName', e.target.value)} placeholder="Your full name"
                                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.contactName ? 'border-red-400' : 'border-slate-300 focus:border-blue-400'}`}
                                />
                                {errors.contactName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.contactName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                <input type="tel" value={form.contactPhone} onChange={(e) => updateForm('contactPhone', e.target.value)} placeholder="98XXXXXXXX"
                                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.contactPhone ? 'border-red-400' : 'border-slate-300 focus:border-blue-400'}`}
                                />
                                {errors.contactPhone && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.contactPhone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1.5" />Service Address <span className="text-red-500">*</span>
                                </label>
                                <textarea value={form.address} onChange={(e) => updateForm('address', e.target.value)}
                                    placeholder="House no., Street, Ward, Municipality/City" rows={2}
                                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none ${errors.address ? 'border-red-400' : 'border-slate-300 focus:border-blue-400'}`}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.address}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-1.5" />Additional Notes (Optional)
                                </label>
                                <textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)}
                                    placeholder="Describe the issue or any specific requirements..." rows={2}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                                />
                            </div>
                            
                            {submitError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
                    <button
                        type="button"
                        onClick={() => step === 0 ? handleClose() : setStep(step - 1)}
                        className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:border-slate-400 transition-colors"
                    >
                        {step === 0 ? 'Cancel' : 'Back'}
                    </button>
                    <button
                        type="button"
                        onClick={step === 2 ? handleSubmit : handleNext}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : step === 2 ? 'Confirm Booking' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
