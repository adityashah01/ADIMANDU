import { ArrowRight, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProfessionalCTA() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 py-20 text-white sm:py-24 border-t border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.15),_transparent_42%)]" />
            <div className="absolute left-[-3rem] top-8 h-36 w-36 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute bottom-[-2rem] right-[-1rem] h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="max-w-2xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4" />
                        नेपाली प्राविधिकहरूको रोजाइ
                    </div>
                    <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl text-white">
                        Become a Sewa Professional & Grow Your Income Daily
                    </h2>
                    <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
                        Showcase your skills, receive high-trust local bookings across Nepal, and manage your jobs with automated Khalti escrows and fair fixed rates.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={() => navigate('/become-provider')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:-translate-y-0.5 text-sm cursor-pointer"
                        >
                            Join as a Professional (दर्ता हुनुहोस्)
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => navigate('/categories')}
                            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 text-sm cursor-pointer"
                        >
                            Explore Available Services
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-md rounded-[28px] border border-slate-700/80 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trusted In Nepal</p>
                            <p className="text-lg font-bold text-white">More Bookings, Guaranteed Pay</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 px-4 py-3">
                            <span className="text-xs text-slate-300">Verified Local Leads</span>
                            <span className="font-bold text-amber-400 text-sm">24/7 Kathmandu Valley</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 px-4 py-3">
                            <span className="text-xs text-slate-300">Average Earning Growth</span>
                            <span className="flex items-center gap-1 font-bold text-emerald-400 text-sm">
                                <TrendingUp className="h-4 w-4" /> +40% First Month
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProfessionalCTA;

