import { useState, useEffect } from "react";
import { Search, CalendarDays, Clock3, CheckCircle2, XCircle, ClipboardList, ChevronRight, X, AlertCircle } from "lucide-react";
import { serviceRequestsApi } from "../../services/api";

const STATUS_STYLE = {
  PENDING: { tab: "bg-[#E8A33D]", stamp: "text-[#8A5A15] border-[#E8A33D]" },
  INSPECTION_REQUESTED: { tab: "bg-[#3B6E8F]", stamp: "text-[#3B6E8F] border-[#3B6E8F]" },
  INSPECTION_SCHEDULED: { tab: "bg-[#3B6E8F]", stamp: "text-[#3B6E8F] border-[#3B6E8F]" },
  INSPECTION_COMPLETED: { tab: "bg-[#6B5B95]", stamp: "text-[#6B5B95] border-[#6B5B95]" },
  QUOTE_SENT: { tab: "bg-[#6B5B95]", stamp: "text-[#6B5B95] border-[#6B5B95]" },
  QUOTE_ACCEPTED: { tab: "bg-[#3E7C59]", stamp: "text-[#3E7C59] border-[#3E7C59]" },
  QUOTE_REJECTED: { tab: "bg-[#B24C3C]", stamp: "text-[#B24C3C] border-[#B24C3C]" },
  COMPLETED: { tab: "bg-[#3E7C59]", stamp: "text-[#3E7C59] border-[#3E7C59]" },
  CANCELLED: { tab: "bg-[#B24C3C]", stamp: "text-[#B24C3C] border-[#B24C3C]" },
};

function formatRs(n) {
  return "Rs. " + Number(n || 0).toLocaleString("en-IN");
}

export default function ManageServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  // Modals
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  const [inspectionData, setInspectionData] = useState({ date: '', time: '' });
  const [quoteData, setQuoteData] = useState({ labour: 0, parts: 0, inspection: 0, diagnosis: '', notes: '' });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await serviceRequestsApi.getProviderRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await serviceRequestsApi.updateStatus(id, status);
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const acceptRequest = async (id) => {
    try {
      await serviceRequestsApi.requestInspection(id);
      fetchRequests();
    } catch (err) {
      console.error("Accept request error:", err);
      alert("Failed to accept request: " + (err.message || "Unknown error"));
    }
  };

  const scheduleInspection = async () => {
    if (!inspectionData.date || !inspectionData.time) {
      alert("Please select both a date and time.");
      return;
    }
    try {
      await serviceRequestsApi.scheduleInspection(selected.id, {
        scheduledDate: inspectionData.date,
        scheduledTime: inspectionData.time
      });
      setShowInspectionModal(false);
      setInspectionData({ date: '', time: '' });
      fetchRequests();
    } catch (err) {
      console.error("Schedule inspection error:", err);
      alert("Failed to schedule inspection: " + (err.message || "Unknown error"));
    }
  };

  const sendQuote = async () => {
    try {
      await serviceRequestsApi.completeInspection(selected.id, {
        diagnosis: quoteData.diagnosis,
        providerNotes: quoteData.notes
      });
      await serviceRequestsApi.createOrUpdateQuote(selected.id, {
        labourCost: quoteData.labour,
        partsCost: quoteData.parts,
        inspectionCost: quoteData.inspection,
        description: quoteData.notes,
        send: true
      });
      setShowQuoteModal(false);
      fetchRequests();
    } catch (err) {
      alert("Failed to send quote");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "#F6F3EC", color: "#20261F" }}>
      <div className="max-w-6xl mx-auto font-body">
        <h1 className="font-display text-4xl font-semibold mb-8">Service Requests</h1>

        {loading ? (
          <div className="text-center py-20"><div className="w-10 h-10 border-4 border-[#3B6E8F] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : (
          <div className="divide-y rounded-xl bg-white overflow-hidden" style={{ border: "1px solid #E7E2D4" }}>
            {requests.map(req => {
              const s = STATUS_STYLE[req.status] || STATUS_STYLE.PENDING;
              return (
                <div key={req.id} className="flex hover:bg-[#FBFAF6] transition-colors p-6 gap-6 items-center">
                  <div className={`w-1.5 shrink-0 h-16 rounded ${s.tab}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{req.customer?.name}</h3>
                        <p className="text-sm text-gray-600">{req.serviceName}</p>
                        <p className="text-xs text-gray-500 mt-1">{req.address}</p>
                        <div className="mt-2 flex gap-3 text-xs">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                            <strong>Method:</strong> {req.paymentMethod === 'KHALTI' ? 'Khalti Online' : (req.paymentMethod || 'Not specified')}
                          </span>
                          <span className={`px-2 py-1 rounded ${req.paymentStatus === 'ESCROW_HELD' || req.paymentStatus === 'RELEASED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            <strong>Payment:</strong> {req.paymentStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <span className={`stamp text-xs font-semibold uppercase px-3 py-1 rounded border-2 border-dashed ${s.stamp}`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {req.status === 'PENDING' && (
                        <button onClick={() => acceptRequest(req.id)} className="bg-[#3B6E8F] text-white px-4 py-2 rounded text-sm">Accept Request</button>
                      )}
                      {req.status === 'INSPECTION_REQUESTED' && (
                        <button onClick={() => { setSelected(req); setShowInspectionModal(true); }} className="bg-[#3B6E8F] text-white px-4 py-2 rounded text-sm">Schedule Inspection</button>
                      )}
                      {req.status === 'INSPECTION_SCHEDULED' && (
                        <button onClick={() => { setSelected(req); setShowQuoteModal(true); }} className="bg-[#6B5B95] text-white px-4 py-2 rounded text-sm">Complete Inspection & Send Quote</button>
                      )}
                      {req.status === 'QUOTE_ACCEPTED' && (
                        <button onClick={() => updateStatus(req.id, 'COMPLETED')} className="bg-[#3E7C59] text-white px-4 py-2 rounded text-sm">Mark Job Completed</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showInspectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Schedule Inspection</h3>
            <input type="date" className="w-full border p-2 rounded mb-3" onChange={e => setInspectionData({...inspectionData, date: e.target.value})} />
            <input type="time" className="w-full border p-2 rounded mb-4" onChange={e => setInspectionData({...inspectionData, time: e.target.value})} />
            <div className="flex gap-2">
              <button onClick={scheduleInspection} className="flex-1 bg-blue-600 text-white py-2 rounded">Schedule</button>
              <button onClick={() => setShowInspectionModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Submit Quote</h3>
            <div className="space-y-3">
              <div><label className="text-sm">Diagnosis</label><textarea className="w-full border p-2 rounded" rows="2" onChange={e => setQuoteData({...quoteData, diagnosis: e.target.value})}></textarea></div>
              <div><label className="text-sm">Labour Cost</label><input type="number" className="w-full border p-2 rounded" onChange={e => setQuoteData({...quoteData, labour: e.target.value})} /></div>
              <div><label className="text-sm">Parts Cost</label><input type="number" className="w-full border p-2 rounded" onChange={e => setQuoteData({...quoteData, parts: e.target.value})} /></div>
              <div><label className="text-sm">Inspection Fee (already charged)</label><input type="number" className="w-full border p-2 rounded" value={selected?.inspectionFee || 0} readOnly /></div>
              <div className="flex gap-2 mt-4">
                <button onClick={sendQuote} className="flex-1 bg-purple-600 text-white py-2 rounded">Send Quote</button>
                <button onClick={() => setShowQuoteModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
