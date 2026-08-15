import { ShieldCheck, Sparkles, MapPin } from 'lucide-react';

const highlights = [
    {
        icon: ShieldCheck,
        title: '१००% Verified Karigars',
        description: 'Every technician in Nepal is citizenship-verified and skill-assessed so you can welcome them with full peace of mind.',
    },
    {
        icon: Sparkles,
        title: 'Khalti & Cash Escrow',
        description: 'Book with zero anxiety. We hold your payment securely until you inspect the completed job and approve.',
    },
    {
        icon: MapPin,
        title: 'Hyperlocal Response',
        description: 'From Kathmandu & Lalitpur to Pokhara & Chitwan, connect with top-rated neighborhood specialists within minutes.',
    },
];

function WhySewaCenter() {
    return (
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-slate-50 via-white to-red-50/40">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-red-100/30 to-transparent" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center mb-14">
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-red-600">विश्वसनीय घरेलु सेवा</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">A Smoother, Trusted Way to Care for Your Home</h2>
                    <p className="mt-3 text-base text-slate-600 leading-relaxed">
                        SewaCenter transforms everyday service booking into a transparent, stress-free experience with vetted pros, clear pricing, and reliable customer protection across Nepal.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {highlights.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.title} className="group rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-200">
                                <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/20">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-500">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default WhySewaCenter;

