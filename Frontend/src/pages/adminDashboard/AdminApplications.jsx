import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { CheckCircle2, XCircle, MapPin, Wrench } from "lucide-react";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const data = await adminApi.getApplications();
      setApplications(data || []);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApi.approveApplication(id, "Approved by admin");
      fetchApplications();
    } catch (error) {
      console.error("Failed to approve application", error);
      alert("Failed to approve application.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this application?")) return;
    try {
      await adminApi.rejectApplication(id, "Rejected by admin");
      fetchApplications();
    } catch (error) {
      console.error("Failed to reject application", error);
      alert("Failed to reject application.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Provider Applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and approve new service provider applications.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h3 className="mt-4 font-bold text-slate-900">All caught up!</h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no pending applications at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {app.user?.name ? app.user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{app.user?.name || "Unknown User"}</h3>
                  <p className="text-xs text-slate-500">{app.user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{app.category?.name || "Unknown Category"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{app.location}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.skills.map((skill, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Bio</span>
                  <p className="text-xs line-clamp-3">{app.bio}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Experience</span>
                  <p className="text-xs">{app.experience}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleReject(app.id)}
                  className="flex-1 flex justify-center items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(app.id)}
                  className="flex-1 flex justify-center items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
