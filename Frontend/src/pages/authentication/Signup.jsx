import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";

function Signup() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [form, setForm] = useState({
        name: "",
        role: "",
        email: "",
        password: "",
        terms: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (error) setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.terms) {
            setError("You must agree to the Terms of Service and Privacy Policy.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await authApi.register({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            });

            if (!result?.user) {
                throw new Error("Invalid response received from the server.");
            }

            setUser(result.user);

            const role = String(result.user.role || "").toLowerCase();

            if (role === "provider") {
                navigate("/become-provider", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (signupError) {
            setError(signupError.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md rounded-none bg-white p-8 border border-stone-200">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-stone-100 text-stone-800 text-[9px] font-black uppercase tracking-wider mb-3">
                        दर्ता • JOIN REGISTRY
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-stone-900 uppercase">
                        Create Account
                    </h1>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                        Already have an account?
                        <Link
                            to="/login"
                            className="ml-1 font-black text-red-700 hover:text-stone-900 transition-colors"
                        >
                            Sign in
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
                            htmlFor="name"
                            className="block text-[10px] font-black uppercase tracking-wider text-stone-500"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            autoComplete="name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                            className="mt-1 block w-full rounded-none border border-stone-200 px-3 py-2 text-stone-900 shadow-none placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-0 disabled:bg-stone-50 text-xs font-semibold"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="role"
                            className="block text-[10px] font-black uppercase tracking-wider text-stone-500"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            required
                            value={form.role}
                            onChange={handleChange}
                            disabled={loading}
                            className="mt-1 block w-full rounded-none border border-stone-200 px-3 py-2 text-stone-900 shadow-none focus:border-stone-900 focus:outline-none focus:ring-0 disabled:bg-stone-50 text-xs font-semibold"
                        >
                            <option value="">Select Role</option>
                            <option value="customer">Customer</option>
                            <option value="provider">Provider</option>
                        </select>
                    </div>

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
                            className="mt-1 block w-full rounded-none border border-stone-200 px-3 py-2 text-stone-900 shadow-none placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-0 disabled:bg-stone-50 text-xs font-semibold"
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
                            minLength={8}
                            autoComplete="new-password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                            className="mt-1 block w-full rounded-none border border-stone-200 px-3 py-2 text-stone-900 shadow-none placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-0 disabled:bg-stone-50 text-xs font-semibold"
                            placeholder="At least 8 characters"
                        />
                    </div>

                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            id="terms"
                            name="terms"
                            checked={form.terms}
                            onChange={handleChange}
                            disabled={loading}
                            className="mt-0.5 h-4 w-4 rounded-none border-stone-300 text-stone-900 focus:ring-0 accent-stone-900"
                        />
                        <label
                            htmlFor="terms"
                            className="ml-2 block text-xs text-stone-500 font-bold uppercase tracking-wider"
                        >
                            I agree to the Terms and Privacy Policy.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-none bg-stone-900 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-none transition-all duration-200 hover:bg-stone-850 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Signing up..." : "Sign up"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
