import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const email = form.email.trim();
        const password = form.password;

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await authApi.login({ email, password });

            if (!result?.user) {
                throw new Error("Invalid response received from the server.");
            }

            setUser(result.user);

            const role = String(result.user.role || "").toLowerCase();
            const requestedPath = location.state?.from;

            if (requestedPath) {
                navigate(requestedPath, { replace: true });
            } else if (role === "admin") {
                navigate("/admin", { replace: true });
            } else if (role === "provider") {
                navigate("/provider", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (loginError) {
            setError(loginError.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md rounded-none bg-white p-8 border border-stone-200">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-stone-100 text-stone-800 text-[9px] font-black uppercase tracking-wider mb-3">
                        नेपाल • AUTHENTIC SEWA
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-stone-900 uppercase">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                        Don&apos;t have an account?
                        <Link
                            to="/signup"
                            className="ml-1 font-black text-red-700 hover:text-stone-900 transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-4 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-red-700"
                    >
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-[10px] font-black uppercase tracking-wider text-stone-500"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            className="mt-1 block w-full rounded-none border border-stone-200 px-3 py-2 text-stone-900 shadow-none placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-stone-50 text-xs font-semibold"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-[10px] font-black uppercase tracking-wider text-stone-500"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                            className="mt-1 block w-full rounded-none border border-stone-200 px-3 py-2 text-stone-900 shadow-none placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-stone-50 text-xs font-semibold"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-none bg-stone-900 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-none transition-all duration-200 hover:bg-stone-850 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
