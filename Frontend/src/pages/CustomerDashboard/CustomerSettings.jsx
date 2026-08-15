import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import {
    User, Phone, Mail, CheckCircle, AlertCircle,
    Loader, Camera, Upload, X, Link as LinkIcon
} from "lucide-react";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

function getInitials(name) {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

async function uploadToCloudinary(file) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.");
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
}

export default function CustomerSettings() {
    const { user, setUser } = useAuth();

    const [form, setForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
    });

    // Avatar state
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [avatarMode, setAvatarMode] = useState("preview"); // "preview" | "url"
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (status) setStatus(null);
    };

    // --- Avatar handlers ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg("Image must be under 5 MB.");
            setStatus("error");
            return;
        }
        setAvatarFile(file);
        setAvatarMode("preview");
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
        setStatus(null);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview("");
        setAvatarUrl("");
        setAvatarMode("preview");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUrlChange = (e) => {
        setAvatarUrl(e.target.value);
        setAvatarPreview(e.target.value);
    };

    // --- Form submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setErrorMsg("Name cannot be empty.");
            setStatus("error");
            return;
        }
        setStatus("loading");
        setErrorMsg("");

        try {
            let finalAvatarUrl = avatarUrl;

            // If user picked a file, upload it first
            if (avatarFile) {
                setUploadingAvatar(true);
                try {
                    finalAvatarUrl = await uploadToCloudinary(avatarFile);
                } catch (uploadErr) {
                    // Cloudinary not configured — try base64 fallback (only works if DB supports it)
                    // For now, surface the error clearly
                    setErrorMsg(uploadErr.message);
                    setStatus("error");
                    setUploadingAvatar(false);
                    return;
                } finally {
                    setUploadingAvatar(false);
                }
            }

            const result = await authApi.updateProfile({
                name: form.name.trim(),
                phone: form.phone.trim(),
                avatarUrl: finalAvatarUrl,
            });

            setUser(result.user);
            setAvatarFile(null);
            setAvatarUrl(finalAvatarUrl);
            setAvatarPreview(finalAvatarUrl);
            setStatus("success");
        } catch (err) {
            setErrorMsg(err.message || "Failed to update profile. Please try again.");
            setStatus("error");
        }
    };

    const currentAvatar = avatarPreview || user?.avatarUrl || "";
    const cloudinaryConfigured = !!CLOUDINARY_CLOUD_NAME && !!CLOUDINARY_UPLOAD_PRESET;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Update your personal information and profile picture</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* ── Avatar Card ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Camera size={18} className="text-blue-500" />
                            Profile Picture
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Upload a photo or paste an image URL</p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center gap-6">
                            {/* Avatar Preview */}
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md border-4 border-white ring-2 ring-slate-200">
                                    {currentAvatar ? (
                                        <img
                                            src={currentAvatar}
                                            alt="avatar preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatarPreview("")}
                                        />
                                    ) : (
                                        getInitials(form.name || user?.name)
                                    )}
                                </div>
                                {currentAvatar && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition shadow"
                                        title="Remove photo"
                                    >
                                        <X size={11} />
                                    </button>
                                )}
                            </div>

                            {/* Upload controls */}
                            <div className="flex-1 space-y-3">
                                {/* Mode toggle */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAvatarMode("preview")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${avatarMode === "preview" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                    >
                                        <Upload size={12} /> Upload file
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAvatarMode("url")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${avatarMode === "url" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                    >
                                        <LinkIcon size={12} /> Paste URL
                                    </button>
                                </div>

                                {avatarMode === "preview" ? (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="avatar-file"
                                        />
                                        <label
                                            htmlFor="avatar-file"
                                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600 transition"
                                        >
                                            <Camera size={15} />
                                            {avatarFile ? avatarFile.name : "Choose image..."}
                                        </label>
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            {cloudinaryConfigured
                                                ? "JPG, PNG, GIF up to 5 MB — uploaded via Cloudinary"
                                                : "⚠️ Set VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET in .env to enable uploads"}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="url"
                                            value={avatarUrl}
                                            onChange={handleUrlChange}
                                            placeholder="https://example.com/photo.jpg"
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                        <p className="mt-1.5 text-xs text-slate-400">Paste any public image URL</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Profile Information Card ─────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <User size={18} className="text-blue-500" />
                            Profile Information
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Update your name and contact number</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Email address cannot be changed.</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 9812345678"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>
                        </div>

                        {/* Status messages */}
                        {status === "success" && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                                <CheckCircle size={16} className="shrink-0" />
                                Profile updated successfully!
                            </div>
                        )}
                        {status === "error" && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                <AlertCircle size={16} className="shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader size={15} className="animate-spin" />
                                        {uploadingAvatar ? "Uploading photo..." : "Saving..."}
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Account Details Card ─────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="font-semibold text-slate-900 mb-4">Account Details</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Account Role</span>
                            <span className="font-medium text-slate-800 capitalize">{String(user?.role || "").toLowerCase()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Account Status</span>
                            <span className="font-medium text-green-600">{user?.status || "Active"}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500">Member Since</span>
                            <span className="font-medium text-slate-800">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                                    : "—"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
