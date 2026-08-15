import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import {
  User, Phone, Mail, CheckCircle, AlertCircle,
  Loader, Camera, Upload, X, Link as LinkIcon,
  Bell, Lock, LogOut, Settings as SettingsIcon
} from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

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

export default function Settings() {
  const { user, setUser, logout } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [notifications, setNotifications] = useState(true);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [avatarMode, setAvatarMode] = useState("preview");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status) setStatus(null);
  };

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
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          finalAvatarUrl = await uploadToCloudinary(avatarFile);
        } catch (uploadErr) {
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
      setErrorMsg(err.message || "Failed to update profile.");
      setStatus("error");
    }
  };

  const currentAvatar = avatarPreview || user?.avatarUrl || "";
  const cloudinaryConfigured = !!CLOUDINARY_CLOUD_NAME && !!CLOUDINARY_UPLOAD_PRESET;

  return (
    <div className="p-6 md:p-10 font-body" style={{ color: "#20261F" }}>
      <div className="max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#20261F" }}>
            <SettingsIcon size={18} color="#F6F3EC" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">Settings</h1>
            <p className="text-sm" style={{ color: "#6B6B63" }}>
              Manage your profile, preferences, and account security.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Avatar / Profile Picture */}
          <div className="rounded-xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #E7E2D4" }}>
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #EFEBDF" }}>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Camera size={18} style={{ color: "#3B6E8F" }} />
                Profile Picture
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#8A8A78" }}>Upload a photo or paste an image URL</p>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#3B6E8F] flex items-center justify-center text-white font-bold text-2xl shadow-sm" style={{ border: "4px solid #F1EEE3" }}>
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" onError={() => setAvatarPreview("")} />
                  ) : (
                    getInitials(form.name || user?.name)
                  )}
                </div>
                {currentAvatar && (
                  <button type="button" onClick={handleRemoveAvatar} className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition shadow" title="Remove photo">
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="flex-1 w-full space-y-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAvatarMode("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${avatarMode === "preview" ? "border-[#3B6E8F] bg-blue-50 text-[#3B6E8F]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    <Upload size={14} /> Upload file
                  </button>
                  <button type="button" onClick={() => setAvatarMode("url")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${avatarMode === "url" ? "border-[#3B6E8F] bg-blue-50 text-[#3B6E8F]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    <LinkIcon size={14} /> Paste URL
                  </button>
                </div>
                {avatarMode === "preview" ? (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="avatar-file" />
                    <label htmlFor="avatar-file" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-[#3B6E8F] hover:text-[#3B6E8F] transition">
                      <Camera size={16} /> {avatarFile ? avatarFile.name : "Choose image..."}
                    </label>
                    <p className="mt-2 text-xs text-gray-400">
                      {cloudinaryConfigured ? "JPG, PNG, GIF up to 5 MB" : "⚠️ Set VITE_CLOUDINARY config in .env to enable uploads"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <input type="url" value={avatarUrl} onChange={handleUrlChange} placeholder="https://example.com/photo.jpg" className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]" style={{ border: "1px solid #E7E2D4", background: "#FBFAF6" }} />
                    <p className="mt-2 text-xs text-gray-400">Paste any public image URL</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="rounded-xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #E7E2D4" }}>
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #EFEBDF" }}>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <User size={18} style={{ color: "#3B6E8F" }} />
                Profile Details
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#6B6B63" }}>Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={user?.email || ""} disabled className="w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-gray-50 cursor-not-allowed" style={{ border: "1px solid #E7E2D4" }} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#6B6B63" }}>Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]" style={{ border: "1px solid #E7E2D4", background: "#FBFAF6" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#6B6B63" }}>Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]" style={{ border: "1px solid #E7E2D4", background: "#FBFAF6" }} />
                  </div>
                </div>
              </div>

              {status === "success" && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  <CheckCircle size={16} /> Profile saved successfully!
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={status === "loading"} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#20261F] hover:bg-black transition-all disabled:opacity-60 flex items-center gap-2">
                  {status === "loading" && <Loader size={15} className="animate-spin" />}
                  {status === "loading" ? (uploadingAvatar ? "Uploading photo..." : "Saving...") : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Account Preferences */}
          <div className="rounded-xl bg-white shadow-sm p-6 space-y-5" style={{ border: "1px solid #E7E2D4" }}>
            <div className="flex items-center justify-between pb-5 border-b border-[#EFEBDF]">
              <div className="flex items-center gap-3">
                <Bell size={20} style={{ color: "#3B6E8F" }} />
                <div>
                  <h2 className="font-semibold text-sm">Booking notifications</h2>
                  <p className="text-xs mt-0.5" style={{ color: "#8A8A78" }}>Get notified for new bookings</p>
                </div>
              </div>
              <ToggleSwitch checked={notifications} onChange={() => setNotifications(!notifications)} activeColor="#3B6E8F" inactiveColor="#E7E2D4" />
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 transition">
              <Lock size={16} /> Change Password
            </button>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm text-red-600 bg-red-50 hover:bg-red-100 transition">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}