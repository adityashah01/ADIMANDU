import { Phone, Mail, MapPin, Globe, Send, MessageCircle, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";

export default function Footer() {
    const navigate = useNavigate();
    
    return (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer mb-3" onClick={() => navigate('/')}>
                            <Logo className="h-9 w-auto" light={true} />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                            Nepal’s premier on-demand marketplace connecting households with verified local Karigars and technicians.
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400">
                            <span>🇳🇵 सेवा नै धर्म हो</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-red-500">Popular Services</h4>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            <li><Link to="/categories" className="hover:text-red-400 transition-colors">All Categories (सबै सेवाहरू)</Link></li>
                            <li><Link to="/ai-match" className="hover:text-amber-400 transition-colors flex items-center gap-1">✨ AI Match Karigar</Link></li>
                            <li><Link to="/search?q=plumbing" className="hover:text-red-400 transition-colors">Plumbing & Water Care</Link></li>
                            <li><Link to="/search?q=electrical" className="hover:text-red-400 transition-colors">Electrical & Wiring</Link></li>
                            <li><Link to="/search?q=cleaning" className="hover:text-red-400 transition-colors">Home Deep Cleaning</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-red-500">For Professionals</h4>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            <li><Link to="/become-provider" className="hover:text-red-400 transition-colors">Join as Karigar (दर्ता गर्नुहोस्)</Link></li>
                            <li><Link to="/login" className="hover:text-red-400 transition-colors">Provider Login</Link></li>
                            <li><a href="#" className="hover:text-red-400 transition-colors">Safety & Standards</a></li>
                            <li><a href="#" className="hover:text-red-400 transition-colors">Khalti Payout Terms</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-red-500">Nepal Support Desk</h4>
                        <ul className="space-y-3 text-xs sm:text-sm">
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-amber-400 shrink-0" /> +977 1-4567890 / 9801234567
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-amber-400 shrink-0" /> support@sewacenter.com.np
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-amber-400 shrink-0" /> Pulchowk, Lalitpur, Nepal
                            </li>
                        </ul>
                        <div className="flex gap-2.5 mt-5">
                            <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-red-600 text-slate-300 hover:text-white transition-colors">
                                <Globe className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-red-600 text-slate-300 hover:text-white transition-colors">
                                <Send className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-red-600 text-slate-300 hover:text-white transition-colors">
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                    <p>© 2026 Sewa Center Nepal Pvt. Ltd. All rights reserved.</p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Proudly built for Nepali households • Kathmandu • Lalitpur • Pokhara
                    </p>
                </div>
            </div>
        </footer>
    );
}
