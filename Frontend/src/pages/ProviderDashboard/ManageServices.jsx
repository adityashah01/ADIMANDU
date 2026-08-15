import { useState, useEffect } from "react";
import { Search, AlertCircle, Loader, Check, Info } from "lucide-react";
import { catalogServicesApi, providerServicesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { categories } from "../../data/categories";

export default function ManageServices() {
  const { user } = useAuth();
  const [myServices, setMyServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [mine, catalog] = await Promise.all([
          providerServicesApi.getMyServices(),
          catalogServicesApi.getAll(),
        ]);
        setMyServices(mine);
        setAvailableServices(catalog);
      } catch (err) {
        setError("Failed to load services. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const providerCategorySlug = user?.providerProfile?.category?.slug;
  
  // Find the category in the static categories data to get price ranges
  const staticCategory = categories.find(c => c.id === providerCategorySlug) || {};
  const staticFixedServices = staticCategory.fixedServices || [];
  
  // Helper to parse min and max from "Rs. 500-1000" or "Rs. 500–1000"
  const getRangeForService = (serviceName) => {
    const staticService = staticFixedServices.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
    if (staticService && staticService.priceRange) {
      const parts = staticService.priceRange.replace(/Rs\.\s*/i, '').split(/[-–]/);
      if (parts.length === 2) {
        return {
          min: parseInt(parts[0].trim(), 10),
          max: parseInt(parts[1].trim(), 10),
          display: staticService.priceRange
        };
      }
    }
    return null;
  };

  // Filter catalog services by provider's category
  const categoryServices = availableServices.filter(
    s => providerCategorySlug && s.category?.slug === providerCategorySlug
  ).filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const fixedServices = categoryServices.filter(s => s.serviceType === 'FIXED_PRICE');
  const inspectionServices = categoryServices.filter(s => s.serviceType === 'INSPECTION_BASED');

  const handleToggleService = async (catalogService, isCurrentlyActive) => {
    setSavingId(catalogService.id);
    try {
      const existing = myServices.find(ms => ms.catalogServiceId === catalogService.id);
      
      if (isCurrentlyActive && existing) {
        // Remove it
        await providerServicesApi.removeService(existing.id);
        setMyServices(ms => ms.filter(m => m.id !== existing.id));
      } else {
        // Add it - use min price of range as default if available
        const range = getRangeForService(catalogService.name);
        const defaultPrice = range ? range.min : catalogService.basePrice;
        
        await providerServicesApi.addService({
          catalogServiceId: catalogService.id,
          customPrice: defaultPrice
        });
        
        // Refresh mine to get the full object with new ID
        const mine = await providerServicesApi.getMyServices();
        setMyServices(mine);
      }
    } catch (err) {
      alert("Failed to update service.");
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdatePrice = async (providerServiceId, newPrice, range) => {
    const priceNum = Number(newPrice);
    
    // Validate range
    if (range) {
      if (priceNum < range.min) {
        alert(`Price cannot be less than ${range.min}`);
        return false; // Return false to indicate validation failed
      }
      if (priceNum > range.max) {
        alert(`Price cannot be more than ${range.max}`);
        return false; 
      }
    }

    try {
      await providerServicesApi.updateService(providerServiceId, { customPrice: priceNum });
      setMyServices(ms => ms.map(m => m.id === providerServiceId ? { ...m, customPrice: priceNum } : m));
      return true;
    } catch (err) {
      alert("Failed to update price.");
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "#F6F3EC", color: "#20261F" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Services</h1>
          <p className="text-gray-600">
            Select the services you offer from your category 
            <strong className="text-gray-800 ml-1 capitalize">{user?.providerProfile?.category?.name || providerCategorySlug}</strong>. 
            The platform defines the categories, services, and allowable price ranges.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E2D4] mb-8 flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search available services..."
            className="w-full outline-none text-sm bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E2D4] p-6 md:p-8">
          
          {categoryServices.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No platform services found for your category.</p>
              <p className="text-sm mt-1">Please contact the admin to add services to this category.</p>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* Fixed Price Services */}
              {fixedServices.length > 0 && (
                <section>
                  <div className="mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#2A516B]">Fixed Price</h2>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">Standardized Pricing</span>
                  </div>
                  
                  <div className="space-y-3">
                    {fixedServices.map(cs => {
                      const myServiceInfo = myServices.find(ms => ms.catalogServiceId === cs.id);
                      const isChecked = !!myServiceInfo;
                      const range = getRangeForService(cs.name);
                      
                      return (
                        <div key={cs.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isChecked ? 'bg-[#FBFAF6] border-[#3B6E8F]/30 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <button
                              onClick={() => handleToggleService(cs, isChecked)}
                              disabled={savingId === cs.id}
                              className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                                isChecked 
                                ? 'bg-[#3B6E8F] border-[#3B6E8F] text-white' 
                                : 'bg-white border-gray-300 text-transparent hover:border-[#3B6E8F]'
                              } ${savingId === cs.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Check size={14} strokeWidth={3} />
                            </button>
                            <div>
                              <span className={`font-medium ${isChecked ? 'text-gray-900' : 'text-gray-600'}`}>{cs.name}</span>
                              <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                {range ? `Range: ${range.display}` : (cs.basePrice ? `Base: Rs. ${cs.basePrice}` : 'Custom price')}
                              </span>
                            </div>
                          </div>
                          
                          {isChecked && (
                            <div className="flex items-center gap-2 pl-9 sm:pl-0">
                              <span className="text-sm font-medium text-gray-500">→ Rs.</span>
                              <input
                                type="number"
                                className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B6E8F]"
                                defaultValue={myServiceInfo.customPrice || (range ? range.min : cs.basePrice)}
                                min={range ? range.min : 0}
                                max={range ? range.max : undefined}
                                onBlur={async (e) => {
                                  const val = e.target.value;
                                  if (val && Number(val) !== myServiceInfo.customPrice) {
                                    const success = await handleUpdatePrice(myServiceInfo.id, val, range);
                                    if (!success) {
                                      e.target.value = myServiceInfo.customPrice; // Revert to valid price
                                    }
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Inspection Based Services */}
              {inspectionServices.length > 0 && (
                <section>
                  <div className="mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#8E6A45]">Inspection Based</h2>
                    <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded">Custom Quotes</span>
                  </div>
                  
                  <div className="space-y-3">
                    {inspectionServices.map(cs => {
                      const isChecked = myServices.some(ms => ms.catalogServiceId === cs.id);
                      
                      return (
                        <div key={cs.id} className={`flex items-center p-4 rounded-xl border transition-all ${isChecked ? 'bg-[#FBFAF6] border-[#8E6A45]/30 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                          <button
                            onClick={() => handleToggleService(cs, isChecked)}
                            disabled={savingId === cs.id}
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                              isChecked 
                              ? 'bg-[#8E6A45] border-[#8E6A45] text-white' 
                              : 'bg-white border-gray-300 text-transparent hover:border-[#8E6A45]'
                            } ${savingId === cs.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                          <span className={`ml-3 font-medium ${isChecked ? 'text-gray-900' : 'text-gray-600'}`}>{cs.name}</span>
                        </div>
                      );
                    })}

                    {/* Artificial "Accept other custom requests" toggle */}
                    <div className={`flex items-center p-4 rounded-xl border transition-all ${localStorage.getItem('acceptsCustom') === 'true' ? 'bg-[#FBFAF6] border-[#8E6A45]/30 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                      <button
                        onClick={() => {
                          const current = localStorage.getItem('acceptsCustom') === 'true';
                          localStorage.setItem('acceptsCustom', !current);
                          // Force a re-render by updating a dummy state or just window location
                          setSavingId(Math.random()); // Hack to force re-render
                        }}
                        className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                          localStorage.getItem('acceptsCustom') === 'true'
                          ? 'bg-[#8E6A45] border-[#8E6A45] text-white' 
                          : 'bg-white border-gray-300 text-transparent hover:border-[#8E6A45]'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>
                      <span className={`ml-3 font-medium ${localStorage.getItem('acceptsCustom') === 'true' ? 'text-gray-900' : 'text-gray-600'}`}>Accept other custom requests</span>
                    </div>

                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}