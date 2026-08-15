import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Calendar, Clock, MapPin, ChevronRight, Home as HomeIcon,
    CheckCircle, AlertCircle, Info, FileText, CreditCard, Banknote, Zap
} from 'lucide-react';
import { providersApi, bookingsApi, catalogServicesApi, serviceRequestsApi, paymentsApi } from '../../services/api';
import { useLocation } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

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

export default function BookingFormPage() {
    const { providerId } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [catalogService, setCatalogService] = useState(null);
    const [loadingProvider, setLoadingProvider] = useState(true);
    const [step, setStep] = useState(1);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const catalogServiceId = searchParams.get('catalogServiceId');
    const customIssue = searchParams.get('customIssue');
    const [submitted, setSubmitted] = useState(false);
    const [createdId, setCreatedId] = useState(null);   // id of the created booking / service-request
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    const [form, setForm] = useState({
        service: '', date: '', time: '', address: '',
        landmark: '', notes: '', contactName: '', contactPhone: '',
        paymentMethod: 'CASH',
    });
    const [errors, setErrors] = useState({});
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loadingBookedSlots, setLoadingBookedSlots] = useState(false);

    const nepalOffset = 5.75 * 60 * 60 * 1000;
    const nowNPT = new Date(new Date().getTime() + nepalOffset);
    const today = nowNPT.toISOString().split('T')[0];

    useEffect(() => {
        if (!providerId || !form.date) {
            setBookedSlots([]);
            return;
        }
        let isMounted = true;
        setLoadingBookedSlots(true);
        bookingsApi.getBookedSlots(providerId, form.date)
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
    }, [providerId, form.date]);

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
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (err) => console.warn("Geolocation failed:", err)
            );
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [providerData, serviceData] = await Promise.all([
                    providersApi.getById(providerId, userLocation),
                    catalogServiceId ? catalogServicesApi.getById(catalogServiceId) : Promise.resolve(null)
                ]);
                setProvider(providerData);
                setCatalogService(serviceData);
                
                if (customIssue) {
                    setForm(f => ({ ...f, service: customIssue }));
                } else if (serviceData) {
                    setForm(f => ({ ...f, service: serviceData.name }));
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoadingProvider(false);
            }
        };
        fetchData();
    }, [providerId, catalogServiceId, userLocation]);

    if (loadingProvider) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Provider Not Found</h2>
                <Link to="/search" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm">Browse Providers</Link>
            </div>
        );
    }

    const availableServices = catalogService ? [catalogService.name] : (serviceOptions[provider.categoryId] || provider.skills);
    const isInspectionBased = catalogService?.serviceType === 'INSPECTION_BASED';
    // Effective price: prefer catalogService price fields, fall back to provider.price
    const effectivePrice = isInspectionBased
        ? Number(catalogService?.inspectionFee || provider.price || 0)
        : Number(catalogService?.basePrice || provider.price || 0);

    const validateStep = (s) => {
        const errs = {};
        if (s === 1) {
            if (!form.service) errs.service = 'Please select a service';
            if (!isInspectionBased) {
                if (!form.date) errs.date = 'Please select a date';
                if (!form.time) errs.time = 'Please select a time slot';
                else if (bookedSlots.includes(form.time)) errs.time = 'This time slot is already booked. Please choose another time.';
            }
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

    const handleNext = () => { if (validateStep(step)) setStep(step + 1); };
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        try {
            let createdRecordId = null;

            if (isInspectionBased) {
                const result = await serviceRequestsApi.create({
                    providerId: provider.id,
                    catalogServiceId: catalogService.id,
                    serviceName: form.service,
                    description: form.notes || form.service,
                    address: `${form.address}${form.landmark ? `, Near ${form.landmark}` : ''}`,
                    paymentMethod: form.paymentMethod,
                });
                createdRecordId = result?.serviceRequest?.id || result?.id || null;
                setCreatedId(createdRecordId);
            } else {
                const result = await bookingsApi.create({
                    providerId: provider.id,
                    catalogServiceId: catalogService?.id,
                    serviceName: form.service,
                    scheduledDate: form.date,
                    timeSlot: form.time,
                    address: form.address,
                    landmark: form.landmark,
                    notes: form.notes,
                    contactName: form.contactName,
                    contactPhone: form.contactPhone,
                    paymentMethod: form.paymentMethod,
                });
                createdRecordId = result?.booking?.id || result?.id || null;
                setCreatedId(createdRecordId);
            }

            // If Khalti selected, initiate payment immediately
            if (form.paymentMethod === 'KHALTI' && createdRecordId) {
                try {
                    const pay = await paymentsApi.initiate(createdRecordId);
                    if (pay?.payment_url) {
                        if (pay.payment_url.startsWith('/')) {
                            navigate(pay.payment_url);
                        } else {
                            window.location.href = pay.payment_url;
                        }
                        return;
                    }
                } catch (payErr) {
                    console.warn("Payment initiation redirected warning:", payErr);
                }
            }
            
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit booking:", error);
            setSubmitError(error.message || "Failed to create booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateForm = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    };

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
                <p className="text-slate-500 mb-2">Your booking with <span className="font-semibold text-slate-700">{provider.name}</span> has been placed.</p>
                <p className="text-slate-500 mb-8">
                    {isInspectionBased 
                        ? <span className="font-medium text-slate-700">The provider will review your request and schedule an inspection soon.</span>
                        : <><span className="font-medium text-slate-700">{form.date}</span> at <span className="font-medium text-slate-700">{form.time}</span></>
                    }
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 text-left mb-8">
                    <p className="font-semibold mb-1 flex items-center gap-1.5"><Info className="w-4 h-4" /> What's next?</p>
                    <ul className="space-y-1 list-disc list-inside text-blue-600">
                        {isInspectionBased ? (
                            <>
                                <li>The provider will review your request.</li>
                                <li>An inspection visit will be scheduled.</li>
                                <li>Track your request status in My Bookings.</li>
                            </>
                        ) : (
                            <>
                                <li>The provider will confirm your booking shortly.</li>
                                <li>You'll receive a call from {provider.name}.</li>
                                <li>Track your booking in My Bookings.</li>
                            </>
                        )}
                    </ul>
                </div>
                <div className="flex gap-3 justify-center">
                    {createdId && !isInspectionBased && (
                        <button
                            onClick={() => navigate(`/bookings/${createdId}`)}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                            View Booking Details
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/bookings')}
                        className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:border-slate-400 transition-colors"
                    >
                        {isInspectionBased ? 'View My Requests' : 'All Bookings'}
                    </button>
                    <button onClick={() => navigate('/')} className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:border-slate-400 transition-colors">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
                <Link to="/" className="flex items-center gap-1 hover:text-blue-600"><HomeIcon className="w-3.5 h-3.5" /> Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`/providers/${provider.id}`} className="hover:text-blue-600">{provider.name}</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-700 font-medium">Book</span>
            </nav>

            <h1 className="text-2xl font-bold text-slate-800 mb-1">Book Service</h1>
            <p className="text-slate-500 mb-8">with <span className="font-semibold text-slate-700">{provider.name}</span></p>

            <div className="flex items-center mb-10">
                {[{ n: 1, label: 'Service & Time' }, { n: 2, label: 'Your Details' }, { n: 3, label: 'Review' }, { n: 4, label: 'Payment' }].map(({ n, label }, i) => (
                    <div key={n} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > n ? 'bg-green-500 text-white' : step === n ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {step > n ? <CheckCircle className="w-5 h-5" /> : n}
                            </div>
                            <span className="text-xs mt-1 text-slate-500 font-medium whitespace-nowrap hidden sm:block">{label}</span>
                        </div>
                        {i < 3 && <div className={`flex-1 h-0.5 mx-1 ${step > n + 1 ? 'bg-green-400' : step > n ? 'bg-blue-400' : 'bg-slate-200'}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
                    <img src={provider.avatar} alt={provider.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                        <div className="font-semibold text-slate-800">{provider.name}</div>
                        <div className="text-sm text-blue-600">{provider.category}</div>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="font-bold text-slate-800">Rs. {effectivePrice.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">{isInspectionBased ? 'inspection fee' : (provider.priceUnit || 'per visit')}</div>
                        {provider.distance && <div className="text-[10px] text-blue-600 font-bold mt-0.5">{provider.distance} km away</div>}
                    </div>
                </div>

                {hasValidKey && provider.latitude && provider.longitude && (
                    <div className="h-40 w-full border-b border-slate-200">
                         <APIProvider apiKey={API_KEY} version="weekly">
                            <Map
                                defaultCenter={{ lat: provider.latitude, lng: provider.longitude }}
                                defaultZoom={13}
                                mapId="BOOKING_MINI_MAP"
                                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                            >
                                <AdvancedMarker position={{ lat: provider.latitude, lng: provider.longitude }}>
                                    <Pin background={'#2563eb'} glyphColor={'#fff'} />
                                </AdvancedMarker>
                                {userLocation && (
                                    <AdvancedMarker position={userLocation}>
                                        <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
                                    </AdvancedMarker>
                                )}
                            </Map>
                        </APIProvider>
                    </div>
                )}

                <div className="p-5 sm:p-6">
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Service <span className="text-red-500">*</span></label>
                                {customIssue ? (
                                    <div className="px-4 py-3 rounded-xl border border-blue-500 bg-blue-50 text-blue-700 font-medium text-sm">
                                        {customIssue}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableServices.map((svc) => (
                                            <button key={svc} type="button" onClick={() => updateForm('service', svc)}
                                                className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${form.service === svc ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >{svc}</button>
                                        ))}
                                    </div>
                                )}
                                {errors.service && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.service}</p>}
                            </div>

                            {!isInspectionBased && (
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
                                        {loadingBookedSlots && <span className="text-[11px] font-normal text-slate-400">Checking availability...</span>}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {timeSlots.map((t) => {
                                            const isPast = !filteredTimeSlots.includes(t);
                                            const isBooked = bookedSlots.includes(t);
                                            const isDisabled = isPast || isBooked;
                                            const isSelected = form.time === t;

                                            return (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => updateForm('time', t)}
                                                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500 font-semibold'
                                                            : isBooked
                                                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            : isPast
                                                            ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                                                            : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>{t}</span>
                                                    {isBooked ? (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Booked</span>
                                                    ) : isPast ? (
                                                        <span className="text-[10px] text-slate-400">Passed</span>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                        {filteredTimeSlots.length === 0 && form.date === today && (
                                            <p className="col-span-2 text-xs text-red-500 py-2">No more slots available for today.</p>
                                        )}
                                    </div>
                                    {errors.time && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.time}</p>}
                                </div>
                            </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
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
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Landmark (Optional)</label>
                                <input type="text" value={form.landmark} onChange={(e) => updateForm('landmark', e.target.value)}
                                    placeholder="Near school, temple, chowk..."
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-1.5" />Additional Notes (Optional)
                                </label>
                                <textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)}
                                    placeholder="Describe the issue or any specific requirements..." rows={3}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 mb-3">Review Your Booking</h3>
                            {[
                                { label: 'Service', value: form.service },
                                ...(!isInspectionBased ? [
                                    { label: 'Date', value: form.date ? new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '' },
                                    { label: 'Time', value: form.time }
                                ] : []),
                                { label: 'Contact', value: form.contactName },
                                { label: 'Phone', value: form.contactPhone },
                                { label: 'Address', value: `${form.address}${form.landmark ? ` (Near ${form.landmark})` : ''}` },
                                ...(form.notes ? [{ label: 'Notes', value: form.notes }] : []),
                            ].map(({ label, value }) => (
                                <div key={label} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500 text-sm w-24 shrink-0">{label}</span>
                                    <span className="text-slate-800 text-sm font-medium">{value}</span>
                                </div>
                            ))}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex gap-2 mt-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>
                                    {isInspectionBased
                                        ? `Rs. ${effectivePrice.toLocaleString()} is the inspection/visit fee. Final price depends on the job.`
                                        : `Fixed price: Rs. ${effectivePrice.toLocaleString()} ${provider.priceUnit || 'per visit'}.`}
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 mb-1">Choose Payment Method</h3>
                            <p className="text-sm text-slate-500 mb-4">How would you like to pay for this service?</p>

                            <button
                                type="button"
                                onClick={() => updateForm('paymentMethod', 'KHALTI')}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                    form.paymentMethod === 'KHALTI'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#5C2D91' }}>
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800">Pay via Khalti</p>
                                    <p className="text-xs text-slate-500">Secure online payment — funds held in escrow until job is done</p>
                                </div>
                                {form.paymentMethod === 'KHALTI' && <CheckCircle className="w-5 h-5 text-purple-600 shrink-0" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => updateForm('paymentMethod', 'CASH')}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                    form.paymentMethod === 'CASH'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Banknote className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800">Cash on Service Completion</p>
                                    <p className="text-xs text-slate-500">Pay the provider directly after the job is done</p>
                                </div>
                                {form.paymentMethod === 'CASH' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                            </button>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex gap-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Total: <strong>Rs. {effectivePrice.toLocaleString()}</strong> {provider.priceUnit || 'per visit'}. {form.paymentMethod === 'KHALTI' ? 'You will be redirected to Khalti after confirming.' : 'Pay cash directly to the provider after service.'}</span>
                            </div>

                            {submitError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                        <button type="button"
                            onClick={() => step === 1 ? navigate(`/providers/${provider.id}`) : setStep(step - 1)}
                            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:border-slate-400 transition-colors"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <button
                            type="button"
                            onClick={step === 4 ? handleSubmit : handleNext}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                            style={step === 4 ? {
                                background: form.paymentMethod === 'KHALTI'
                                    ? 'linear-gradient(135deg,#5C2D91,#7C3AED)'
                                    : '#16a34a',
                                color: '#fff',
                                boxShadow: form.paymentMethod === 'KHALTI' ? '0 4px 15px rgba(124,58,237,0.35)' : '0 4px 15px rgba(22,163,74,0.3)'
                            } : { background: '#2563eb', color: '#fff' }}
                        >
                            {isSubmitting ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                            ) : step === 4 ? (
                                form.paymentMethod === 'KHALTI'
                                    ? <><Zap className="w-4 h-4" /> Confirm & Pay via Khalti</>
                                    : <><CheckCircle className="w-4 h-4" /> Confirm Booking (Cash)</>
                            ) : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
