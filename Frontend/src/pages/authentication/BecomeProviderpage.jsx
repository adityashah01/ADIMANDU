import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, FileText, Upload, CheckCircle,
    ChevronRight, ChevronLeft, Send, Award, Briefcase, Star, AlertCircle,
    RefreshCw
} from 'lucide-react';
import { categories } from '../../data/categories';
import { providersApi } from '../../services/api';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const steps = [
    { label: 'Personal Info', icon: User },
    { label: 'Service Details', icon: Briefcase },
    { label: 'Experience', icon: FileText },
    { label: 'Review', icon: CheckCircle },
];

export default function BecomeProviderPage() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        // name: '',
        // email: '',
        phone: '',
        location: '',
        latitude: null,
        longitude: null,
        categoryId: '',
        skills: '',
        experience: '',
        bio: '',
        profileImageUrl: '',
        skillCertificateUrl: '',
        experienceCertUrl: '',
        agreeToTerms: false,
    });

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setForm(f => ({
                        ...f,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                (err) => console.warn("Geolocation failed:", err)
            );
        }
    };

    useEffect(() => {
        detectLocation();
    }, []);

    const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const validateStep = (s) => {
        if (s === 0) {
            // if (!form.name.trim()) return 'Name is required';
            // if (!form.email.trim()) return 'Email is required';
            // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format';
            if (!form.phone.trim()) return 'Phone number is required';
        }
        if (s === 1) {
            if (!form.categoryId) return 'Please select a service category';
            if (!form.skills.trim()) return 'Please list your skills';
        }
        if (s === 2) {
            if (!form.experience.trim()) return 'Experience details are required';
        }
        if (s === 3) {
            if (!form.agreeToTerms) return 'Please agree to the terms';
        }
        return '';
    };

    const handleNext = () => {
        const err = validateStep(step);
        if (err) {
            setError(err);
            return;
        }
        setError('');
        setStep((s) => Math.min(s + 1, 3));
    };

    const handleSubmit = async () => {
        const err = validateStep(3);
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log({
                phone: form.phone,
                location: form.location,
                categoryId: form.categoryId,
                skills: form.skills,
                experience: form.experience,
                bio: form.bio,
                profileImageUrl: form.profileImageUrl,
                skillCertificateUrl: form.skillCertificateUrl,
                experienceCertUrl: form.experienceCertUrl,
            });
            await providersApi.apply({
                phone: form.phone,
                location: form.location,
                latitude: form.latitude,
                longitude: form.longitude,
                categoryId: form.categoryId,
                skills: form.skills,
                experience: form.experience,
                bio: form.bio,
                profileImageUrl: form.profileImageUrl,
                skillCertificateUrl: form.skillCertificateUrl,
                experienceCertUrl: form.experienceCertUrl,
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl border border-slate-200 p-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-3">Application Submitted!</h1>
                    <p className="text-slate-500 mb-6">
                        Thank you for applying to become a service provider. We'll review your application and get back to you within 2-3 business days.
                    </p>
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-700">
                            <strong>What's next?</strong><br />
                            Our team will verify your details and approve your profile. Once approved, you'll appear in our provider directory.
                        </p>
                    </div>
                    <Link
                        to="/provider"
                        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all"
                    >
                        View Your Dashboard <ChevronRight className="w-4 h-4" />
                    </Link>
                    {/* <span>Your application is under admin's review.Please wait for approval</span> */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">Become a Service Provider</h1>
                    <p className="text-blue-100 text-lg max-w-xl mx-auto">
                        Join our network of trusted professionals and grow your business with ServiceHub.
                    </p>
                </div>
            </section>

            {/* Progress Steps */}
            <section className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = i === step;
                        const isCompleted = i < step;
                        return (
                            <div key={s.label} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-200 text-slate-500'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div
                                        className={`w-12 sm:w-20 lg:w-28 h-1 mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-slate-200'
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Form */}
            <section className="max-w-3xl mx-auto px-4 pb-16">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Step 0: Personal Info */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <div>
                                {/* <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => updateForm('name', e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div> */}

                                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => updateForm('email', e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div> */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => updateForm('phone', e.target.value)}
                                            placeholder="+977 98XXXXXXXX"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Location / Service Area</label>
                                <div className="relative mb-3">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => updateForm('location', e.target.value)}
                                        placeholder="e.g., Lalitpur, Kathmandu"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {hasValidKey && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500">Service Location Pin</span>
                                            <button 
                                                type="button"
                                                onClick={detectLocation}
                                                className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700"
                                            >
                                                <RefreshCw className="w-3 h-3" /> Detect My Location
                                            </button>
                                        </div>
                                        <div className="h-48 w-full rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-slate-50">
                                            <APIProvider apiKey={API_KEY} version="weekly">
                                                <Map
                                                    center={form.latitude ? { lat: form.latitude, lng: form.longitude } : { lat: 27.7172, lng: 85.3240 }}
                                                    zoom={14}
                                                    mapId="PROVIDER_APPLICATION_MAP"
                                                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                                                    gestureHandling={'greedy'}
                                                    disableDefaultUI={false}
                                                    onCenterChanged={(ev) => {
                                                        const center = ev.map.getCenter();
                                                        updateForm('latitude', center.lat());
                                                        updateForm('longitude', center.lng());
                                                    }}
                                                >
                                                    {form.latitude && (
                                                        <AdvancedMarker position={{ lat: form.latitude, lng: form.longitude }}>
                                                            <Pin background={'#2563eb'} glyphColor={'#fff'} />
                                                        </AdvancedMarker>
                                                    )}
                                                </Map>
                                            </APIProvider>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Drag the map to refine your location. Customers will see this pin to calculate distance.</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Picture URL (optional)</label>
                                <div className="relative">
                                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="url"
                                        value={form.profileImageUrl}
                                        onChange={(e) => updateForm('profileImageUrl', e.target.value)}
                                        placeholder="https://example.com/your-photo.jpg"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Provide a direct image URL for your profile picture.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Service Details */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Category *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => updateForm('categoryId', cat.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${form.categoryId === cat.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover mb-2" />
                                            <div className="font-medium text-slate-800 text-sm">{cat.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Skills * <span className="text-slate-400 font-normal">(comma-separated)</span></label>
                                <textarea
                                    value={form.skills}
                                    onChange={(e) => updateForm('skills', e.target.value)}
                                    rows={3}
                                    placeholder="e.g., Pipe Repair, Drain Cleaning, Water Heater Installation"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    <strong>Note:</strong> Once your profile is approved, you will be able to manage your specific services (both fixed-price and inspection-based) and set custom pricing directly from your Provider Dashboard.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Experience */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Experience * <span className="text-slate-400 font-normal">(years or description)</span></label>
                                <input
                                    type="text"
                                    value={form.experience}
                                    onChange={(e) => updateForm('experience', e.target.value)}
                                    placeholder="e.g., 5 years or 'Worked at XYZ company for 3 years'"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">About Yourself <span className="text-slate-400 font-normal">(optional)</span></label>
                                <textarea
                                    value={form.bio}
                                    onChange={(e) => updateForm('bio', e.target.value)}
                                    rows={4}
                                    placeholder="Tell customers about yourself, your expertise, and what makes you stand out..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Skill Certificate URL <span className="text-slate-400 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            value={form.skillCertificateUrl}
                                            onChange={(e) => updateForm('skillCertificateUrl', e.target.value)}
                                            placeholder="https://link-to-certificate.com"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Certificate URL <span className="text-slate-400 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            value={form.experienceCertUrl}
                                            onChange={(e) => updateForm('experienceCertUrl', e.target.value)}
                                            placeholder="https://link-to-certificate.com"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" /> Personal Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {/* <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800">{form.name}</span></div>
                                    <div><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800">{form.email}</span></div> */}
                                    <div><span className="text-slate-500">Phone:</span> <span className="font-medium text-slate-800">{form.phone}</span></div>
                                    <div><span className="text-slate-500">Location:</span> <span className="font-medium text-slate-800">{form.location || 'N/A'}</span></div>
                                </div>

                                <hr className="border-slate-200" />

                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" /> Service Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Category:</span>
                                        <span className="font-medium text-slate-800">
                                            {categories.find(c => c.id === form.categoryId)?.name}
                                        </span>
                                    </div>
                                    <div><span className="text-slate-500">Experience:</span> <span className="font-medium text-slate-800">{form.experience}</span></div>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-500">Skills:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {form.skills.split(',').map((s, i) => s.trim() && (
                                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">{s.trim()}</span>
                                        ))}
                                    </div>
                                </div>

                                {form.bio && (
                                    <>
                                        <hr className="border-slate-200" />
                                        <div className="text-sm">
                                            <span className="text-slate-500">Bio:</span>
                                            <p className="mt-1 text-slate-700">{form.bio}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.agreeToTerms}
                                    onChange={(e) => updateForm('agreeToTerms', e.target.checked)}
                                    className="w-5 h-5 rounded accent-blue-600 mt-0.5"
                                />
                                <span className="text-sm text-slate-600">
                                    I agree to the <span className="text-blue-600 font-medium">Terms of Service</span> and confirm that the information provided is accurate. I understand that my application will be reviewed before approval.
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setStep((s) => Math.max(s - 1, 0))}
                            disabled={step === 0}
                            className="flex items-center gap-2 px-4 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" /> Back
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Continue <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-sm disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" /> Submit Application
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
