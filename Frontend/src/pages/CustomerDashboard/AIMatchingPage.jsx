import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Hammer,
  IndianRupee,
  LoaderCircle,
  MapPin,
  Paintbrush,
  Send,
  Settings,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { aiApi } from "../../services/api";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useLocation } from "../../context/LocationContext";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const CATEGORY_RULES = [
// ... (omitting for brevity in this step, but keeping the actual file content)
// ... (omitting for brevity in this step, but keeping the actual file content)
  {
    slug: "plumbing",
    name: "Plumbing",
    icon: Wrench,
    keywords: [
      "tap",
      "faucet",
      "pipe",
      "leak",
      "leaking",
      "water",
      "drain",
      "toilet",
      "sink",
      "geyser",
      "plumber",
      "sewage",
    ],
    explanation: "The issue appears related to water flow, pipes, drainage, or bathroom/kitchen fittings.",
  },
  {
    slug: "electrical",
    name: "Electrical",
    icon: Zap,
    keywords: [
      "electric",
      "electricity",
      "wire",
      "wiring",
      "switch",
      "socket",
      "fan",
      "light",
      "bulb",
      "fuse",
      "mcb",
      "power",
      "short circuit",
    ],
    explanation: "The issue appears related to wiring, power, lighting, switches, or electrical safety.",
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    icon: Sparkles,
    keywords: [
      "clean",
      "cleaning",
      "dust",
      "dirty",
      "stain",
      "kitchen cleaning",
      "bathroom cleaning",
      "deep clean",
      "office cleaning",
    ],
    explanation: "The request appears to need home, room, kitchen, bathroom, or office cleaning.",
  },
  {
    slug: "tutoring",
    name: "Tutoring",
    icon: GraduationCap,
    keywords: [
      "teacher",
      "tutor",
      "tuition",
      "math",
      "science",
      "english",
      "exam",
      "study",
      "homework",
      "class",
    ],
    explanation: "The request appears related to academic tutoring, homework, or exam preparation.",
  },
  {
    slug: "appliance",
    name: "Appliance Repair",
    icon: Settings,
    keywords: [
      "fridge",
      "refrigerator",
      "washing machine",
      "microwave",
      "ac",
      "air conditioner",
      "television",
      "tv",
      "heater",
      "appliance",
      "machine",
    ],
    explanation: "The issue appears related to a household appliance that needs inspection or repair.",
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    icon: Hammer,
    keywords: [
      "wood",
      "wooden",
      "door",
      "window",
      "furniture",
      "table",
      "chair",
      "cabinet",
      "bed",
      "carpenter",
    ],
    explanation: "The request appears related to wooden furniture, doors, windows, or custom woodwork.",
  },
  {
    slug: "painting",
    name: "Painting",
    icon: Paintbrush,
    keywords: [
      "paint",
      "painting",
      "wall color",
      "wall colour",
      "repaint",
      "interior",
      "exterior",
      "putty",
    ],
    explanation: "The request appears related to wall preparation, interior painting, or exterior painting.",
  },
  {
    slug: "mechanic",
    name: "Mechanic",
    icon: Car,
    keywords: [
      "car",
      "bike",
      "motorbike",
      "vehicle",
      "engine",
      "brake",
      "tyre",
      "tire",
      "mechanic",
      "servicing",
    ],
    explanation: "The issue appears related to a car, bike, engine, brakes, tyres, or general servicing.",
  },
];

const URGENCY_RULES = {
  high: [
    "urgent",
    "emergency",
    "immediately",
    "right now",
    "spark",
    "smoke",
    "flood",
    "burst",
    "overflow",
    "no electricity",
    "short circuit",
    "badly",
    "danger",
  ],
  medium: ["today", "soon", "not working", "broken", "stopped", "problem"],
};

const SUGGESTIONS = [
  "My kitchen tap is leaking badly",
  "The bedroom light and socket are not working",
  "I need deep cleaning for my apartment",
  "My washing machine is making a loud noise",
];



function urgencyClasses(urgency) {
  if (urgency === "High") return "bg-red-50 text-red-700 border border-red-200";
  if (urgency === "Medium") return "bg-stone-100 text-stone-800 border border-stone-200";
  return "bg-stone-50 text-stone-700 border border-stone-200/60";
}

function formatPrice(provider) {
  const price = Number(provider.price || provider.services?.[0]?.price || 0);
  if (!price) return "Price after inspection";

  const upper = Math.round(price * 1.35);
  return `Rs. ${price.toLocaleString()} – ${upper.toLocaleString()}`;
}

function ProviderRow({ provider, rank, onView, onBook }) {
  const displayName = provider.businessName || provider.user?.name || provider.name || "Service Provider";
  const rating = Number(provider.averageRating || provider.rating || 0);
  const reviews = provider.reviewCount || provider.reviews || 0;
  const serviceName = provider.services?.[0]?.name || provider.category?.name || provider.category || "Home service";
  const distance = provider.distance;

  return (
    <article className="group rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-stone-900 sm:p-6">
      <div className="grid items-center gap-6 lg:grid-cols-[40px_1.6fr_1fr_1fr_1.05fr_auto]">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-300 bg-stone-100 text-xs font-bold text-stone-800">
          #{rank}
        </div>

        <div className="flex min-w-0 items-center gap-4.5">
          <img
            src={provider.profileImageUrl || provider.user?.avatarUrl || provider.avatarUrl || provider.image || `https://ui-avatars.com/api/?background=faf9f6&color=1c1917&name=${encodeURIComponent(displayName)}`}
            alt={displayName}
            className="h-14 w-14 rounded-full border border-stone-200 object-cover filter grayscale"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-bold text-stone-900 text-base">{displayName}</h3>
              {provider.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-red-600" />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1 font-bold text-stone-900">
                <Star className="h-3.5 w-3.5 fill-red-600 text-red-600" />
                {rating ? rating.toFixed(1) : "New"}
              </span>
              <span className="font-medium">({reviews} reviews)</span>
              <span>•</span>
              <span className="font-semibold">{provider.experience || "Experienced professional"}</span>
            </div>
            <p className="mt-1 truncate text-xs text-stone-400 font-bold uppercase tracking-wider">{serviceName}</p>
          </div>
        </div>

        <div className="border-stone-100 lg:border-l lg:pl-6">
          <p className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
            <MapPin className="h-4 w-4 text-stone-400" />
            {provider.location || "Kathmandu"}
          </p>
          <p className="mt-1 text-[11px] text-stone-400 font-medium">
            {distance !== undefined && distance !== null ? `${distance} km away` : "Nearby area"}
          </p>
        </div>

        <div className="border-stone-100 lg:border-l lg:pl-6">
          <p className="flex items-center gap-1 text-xs font-bold text-stone-900 uppercase tracking-wider">
            {formatPrice(provider)}
          </p>
          <p className="mt-1 text-[11px] text-stone-400 font-medium">ESTIMATED BASIS</p>
        </div>

        <div className="border-stone-100 lg:border-l lg:pl-6">
          <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${provider.isAvailable ? "text-stone-900" : "text-stone-400"}`}>
            <span className={`h-2 w-2 rounded-full ${provider.isAvailable ? "bg-red-600 animate-pulse" : "bg-stone-300"}`} />
            {provider.isAvailable ? "Available Now" : "Pre-book only"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            <Clock3 className="h-3.5 w-3.5" />
            Rapid response
          </p>
        </div>

        <div className="flex gap-2 lg:flex-col lg:min-w-[140px]">
          <button
            type="button"
            onClick={() => onView(provider.id)}
            className="flex-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider py-3 transition cursor-pointer"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onBook(provider.id)}
            className="flex-1 rounded-lg border border-stone-200 hover:border-stone-900 text-stone-800 font-bold text-xs uppercase tracking-wider py-3 transition cursor-pointer bg-white"
          >
            Book
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AIMatchingPage() {
  const navigate = useNavigate();
  const [issue, setIssue] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { coordinates: userLocation } = useLocation();

  const [messages, setMessages] = useState([]);
  const [askQuestion, setAskQuestion] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);

  const visibleProviders = useMemo(
    () => (showAll ? providers : providers.slice(0, 3)),
    [providers, showAll],
  );

  async function handleMatch(event) {
    event?.preventDefault();

    const cleanIssue = issue.trim();
    if (cleanIssue.length < 5 && !askQuestion) {
      setError("Please describe the problem in at least a few words.");
      return;
    }

    setLoading(true);
    setError("");
    setShowAll(false);
    setAskQuestion("");

    const newMessages = [...messages, { role: "user", content: cleanIssue }];
    setMessages(newMessages);

    try {
      const response = await aiApi.match(newMessages, userLocation);

      if (!response.sufficient) {
        setAskQuestion(response.message);
        setMessages([...newMessages, { role: "assistant", content: response.message }]);
        setIssue("");
      } else {
        const catObj = CATEGORY_RULES.find(c => c.slug === response.extracted.categorySlug) || CATEGORY_RULES[0];
        setAnalysis({
          category: {
            name: response.category || response.extracted.categorySlug,
            icon: catObj.icon
          },
          urgency: response.extracted.urgency,
          confidence: 98,
          summary: response.extracted.serviceDetails
        });
        setProviders(response.providers || []);
      }
    } catch (requestError) {
      setProviders([]);
      setError(requestError.message || "Could not load matching providers.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(suggestion) {
    setIssue(suggestion);
    setAnalysis(null);
    setProviders([]);
    setError("");
    setMessages([]);
    setAskQuestion("");
  }

  const CategoryIcon = analysis?.category?.icon || BrainCircuit;

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="text-center mb-12">
          <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-md border border-stone-200 bg-stone-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-800">
            <Sparkles className="h-3.5 w-3.5 text-red-600" />
            नेपाली एआई सहयोगी • PROMPT MATCH
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-900 leading-none">
            What is your repair need?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-stone-500 font-medium">
            Describe your home maintenance issue in plain language. Our AI evaluates sector category, rates priority, and selects matches from approved regional databases.
          </p>
        </section>

        <form onSubmit={handleMatch} className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-stone-200 bg-white p-5 focus-within:border-stone-900 transition duration-200">
            {askQuestion && (
              <div className="w-full bg-stone-50 p-4 rounded-lg border border-stone-200 text-stone-800 text-xs mb-3 font-semibold flex items-start gap-2.5">
                <BrainCircuit className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <p className="leading-relaxed">{askQuestion}</p>
              </div>
            )}
            <div className="flex w-full items-start gap-4">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-50 border border-stone-200 text-stone-800 sm:flex">
                <Sparkles className="h-4 w-4 text-red-600" />
              </div>
              <textarea
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleMatch(event);
                  }
                }}
                rows={3}
                placeholder="e.g. My bathroom sink pipe is leaking from the joint and water is flooding..."
                className="flex-1 resize-none bg-transparent py-2 text-xs sm:text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 px-5 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer self-end"
                aria-label="Find matching providers"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Match</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-lg border border-stone-200 bg-white hover:border-stone-900 px-3 py-1.5 text-[11px] font-bold text-stone-500 transition cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="mx-auto mt-6 flex max-w-4xl items-start gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {analysis && (
          <section className="mx-auto mt-10 max-w-4xl">
            <div className="mb-4 flex items-center gap-1.5 text-xs text-stone-500 font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-red-600" />
              <span>Sewa AI Analysis Result</span>
            </div>

            <div className="grid gap-6 rounded-xl border border-stone-200 bg-white p-6 md:grid-cols-[1.2fr_0.8fr_1.4fr]">
              <div className="flex items-center gap-4 md:border-r md:border-stone-100 md:pr-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-stone-100 border border-stone-200 text-stone-800">
                  <CategoryIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">PREDICTED SECTOR</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <h2 className="text-base font-black text-stone-900 uppercase tracking-wider">{analysis.category.name}</h2>
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <p className="mt-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{analysis.confidence}% CONFIDENT</p>
                </div>
              </div>

              <div className="md:border-r md:border-stone-100 md:px-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">URGENCY METRIC</p>
                <span className={`mt-2 inline-flex rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${urgencyClasses(analysis.urgency)}`}>
                  {analysis.urgency} Urgency
                </span>
              </div>

              <div className="md:pl-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">SYNTHESIZED SUMMARY</p>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-stone-700">{analysis.summary}</p>
              </div>
            </div>
          </section>
        )}

        {analysis && providers.length > 0 && hasValidKey && (
          <section className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="border-b border-stone-100 bg-stone-50 px-5 py-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
                <MapPin className="h-4 w-4 text-red-600" />
                PROVIDER RADAR LOCATIONS
              </h3>
            </div>
            <div className="h-[380px] w-full">
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={userLocation || { lat: 27.7172, lng: 85.3240 }}
                  defaultZoom={13}
                  mapId="SEWA_MATCH_MAP"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  gestureHandling={'greedy'}
                  disableDefaultUI={false}
                >
                  {userLocation && (
                    <AdvancedMarker position={userLocation} title="You">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute h-10 w-10 animate-ping rounded-full bg-red-400/30" />
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-stone-900 shadow-md">
                          <MapPin className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    </AdvancedMarker>
                  )}

                  {providers.map((p) => (
                    p.latitude && p.longitude && (
                      <AdvancedMarker
                        key={p.id}
                        position={{ lat: p.latitude, lng: p.longitude }}
                        onClick={() => setSelectedMarker(p)}
                      >
                        <Pin background={p.verified ? "#1c1917" : "#78716c"} glyphColor="#fff" />
                      </AdvancedMarker>
                    )
                  ))}

                  {selectedMarker && (
                    <InfoWindow
                      position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="p-1">
                        <h4 className="font-bold text-stone-900 text-xs">{selectedMarker.name || selectedMarker.user?.name}</h4>
                        <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">{selectedMarker.category?.name || selectedMarker.category}</p>
                        <div className="mt-2 flex items-center gap-2">
                           <button 
                            onClick={() => navigate(`/providers/${selectedMarker.id}`)}
                            className="text-[9px] bg-stone-900 text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider"
                           >
                            View
                           </button>
                           <span className="text-[10px] text-stone-500 font-bold">{selectedMarker.distance} km</span>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            </div>
          </section>
        )}

        {analysis && !loading && (
          <section className="mx-auto mt-8 max-w-4xl pb-16">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-stone-900 uppercase tracking-wider">
                  {providers.length ? `TOP ${Math.min(3, providers.length)} RECOMMENDED EXPERTS` : "Matching Experts"}
                </h2>
                <p className="mt-1 text-xs text-stone-500 font-medium">Ranked directly by validation score, proximity, verification level, and active schedule status.</p>
              </div>
              {providers.length > 0 && (
                <span className="rounded border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-800 uppercase tracking-wider">
                  <BrainCircuit className="mr-1 inline h-3.5 w-3.5 text-red-600" />
                  Sorted by algorithm score
                </span>
              )}
            </div>

            {providers.length > 0 ? (
              <>
                <div className="space-y-4">
                  {visibleProviders.map((provider, index) => (
                    <ProviderRow
                      key={provider.id}
                      provider={provider}
                      rank={index + 1}
                      onView={(id) => navigate(`/providers/${id}`)}
                      onBook={(id) => navigate(`/book/${id}?customIssue=${encodeURIComponent(analysis.summary)}`)}
                    />
                  ))}
                </div>

                {providers.length > 3 && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAll((current) => !current)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 hover:border-stone-900 bg-white px-5 py-3 text-xs font-bold text-stone-800 transition cursor-pointer"
                    >
                      {showAll ? "Show top 3" : `View ${providers.length - 3} more providers`}
                      <ChevronDown className={`h-4 w-4 transition ${showAll ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
                <BrainCircuit className="mx-auto h-8 w-8 text-stone-300" />
                <h3 className="mt-3 font-bold text-stone-900 uppercase tracking-wider text-sm">No approved specialists found</h3>
                <p className="mx-auto mt-2 max-w-md text-xs text-stone-500 font-medium leading-relaxed">
                  The issue was analyzed, but no matching providers have been approved under this specific sub-category yet.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/providers?category=${analysis.category.slug}`)}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5"
                >
                  Browse all active registries
                  <ArrowRight className="h-4 w-4 text-red-400" />
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
