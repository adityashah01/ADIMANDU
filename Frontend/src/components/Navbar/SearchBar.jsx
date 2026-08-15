import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../../context/LocationContext";

function SearchBar() {
    const navigate = useNavigate();
    const { location } = useLocation();
    const [query, setQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        const q = query.trim();
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (location && location !== "All Locations") params.set("location", location);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <form
            onSubmit={handleSearch}
            className="flex items-center bg-white border border-slate-200 rounded-full overflow-hidden shadow-xs hover:border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all w-full"
        >
            <div className="flex items-center flex-1 px-4">
                <Search size={17} className="text-slate-400 shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search electrician, plumber, cleaner..."
                    className="w-full px-3 py-2.5 outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
                />
            </div>
            <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 font-bold text-xs sm:text-sm transition-colors shrink-0 m-1 rounded-full shadow-xs"
            >
                Search
            </button>
        </form>
    );
}

export default SearchBar;
