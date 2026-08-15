import { CalendarCheck, CheckCheck, Search, UserCheck } from 'lucide-react';

const steps = [
    {
        title: '१. Search Service',
        subtitle: 'खोज्नुहोस्',
        description: 'Describe your issue or select from curated categories across Nepal.',
        icon: Search,
    },
    {
        title: '२. Choose Verified Pro',
        subtitle: 'छान्नुहोस्',
        description: 'Compare verified Karigar ratings, reviews, distance, and upfront pricing.',
        icon: UserCheck,
    },
    {
        title: '३. Easy Booking',
        subtitle: 'समय मिलाउनुहोस्',
        description: 'Select your preferred time slot and enter your location in Kathmandu Valley or beyond.',
        icon: CalendarCheck,
    },
    {
        title: '४. Doorstep Service',
        subtitle: 'सेवा लिनुहोस्',
        description: 'Your pro arrives on time. Pay securely via Khalti or cash only after 100% satisfaction.',
        icon: CheckCheck,
    },
];

function Howitworks() {
    return (
        <section className="bg-slate-50/70 py-20 sm:py-24 border-b border-slate-200/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-red-600">सजिलो र सुरक्षित प्रक्रिया</p>
                    <h2 className="mt-2.5 text-3xl font-extrabold text-slate-900 sm:text-4xl">How Sewa Center Works</h2>
                    <p className="mt-3 text-base text-slate-500 font-medium">Get your home repairs and services done in four seamless steps.</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <div key={step.title} className="relative rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 shadow-lg shadow-red-600/20">
                                    <Icon className="h-7 w-7 text-white" />
                                    <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-600 bg-amber-400 text-xs font-black text-slate-950">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                                <p className="text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-2">{step.subtitle}</p>
                                <p className="text-xs sm:text-sm leading-relaxed text-slate-500">{step.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Howitworks;
