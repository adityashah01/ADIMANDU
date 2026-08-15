const API_URL = "/api";

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.message || data.error || "An error occurred"
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Fetch failed for URL: ${url}`, error);
    throw error;
  }
};

// =======================
// Providers API
// =======================

export const providersApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();

    return apiFetch(
      `/providers${qs ? `?${qs}` : ""}`
    );
  },

  getById: (id, location = null) => {
    let qs = "";
    if (location && typeof location === 'object' && location.lat !== undefined && location.lng !== undefined) {
      qs = new URLSearchParams({ lat: location.lat, lng: location.lng }).toString();
    } else if (typeof location === 'string') {
      qs = new URLSearchParams({ location }).toString();
    }
    return apiFetch(`/providers/${id}${qs ? `?${qs}` : ""}`);
  },

  apply: (data) =>
    apiFetch("/providers/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// =======================
// Bookings API
// =======================

export const bookingsApi = {
  create: (data) =>
    apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBookedSlots: (providerId, date) =>
    apiFetch(`/bookings/provider/${providerId}/booked-slots?date=${encodeURIComponent(date)}`),

  getById: (id) =>
    apiFetch(`/bookings/${id}`),

  getCustomerBookings: () =>
    apiFetch("/bookings/customer"),

  getProviderBookings: () =>
    apiFetch("/bookings/provider"),

  updateStatus: (id, status) =>
    apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancel: (id, reason) =>
    apiFetch(`/bookings/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  customerComplete: (id, confirmed) =>
    apiFetch(`/bookings/${id}/customer-complete`, {
      method: "PATCH",
      body: JSON.stringify({ confirmed }),
    }),

  updatePaymentStatus: (id, paymentStatus) =>
    apiFetch(`/bookings/${id}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    }),
};

// =======================
// Reviews API
// =======================

export const reviewsApi = {
  create: (bookingId, data) =>
    apiFetch(`/reviews/booking/${bookingId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProviderReviews: (providerId) =>
    apiFetch(`/reviews/provider/${providerId}`),
};

// =======================
// Authentication API
// =======================

export const authApi = {
  register: (data) =>
    apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () =>
    apiFetch("/auth/me"),

  logout: () =>
    apiFetch("/auth/logout", {
      method: "POST",
    }),

  updateProfile: (data) =>
    apiFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// =======================
// Admin API
// =======================

export const adminApi = {
  getDashboardStats: () =>
    apiFetch("/admin/dashboard"),

  getApplications: () =>
    apiFetch("/admin/applications"),

  approveApplication: (id, adminNote) =>
    apiFetch(`/admin/applications/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ adminNote }),
    }),

  rejectApplication: (id, adminNote) =>
    apiFetch(`/admin/applications/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ adminNote }),
    }),

  getUsers: () =>
    apiFetch("/admin/users"),

  getBookings: () =>
    apiFetch("/admin/bookings"),
};

// =======================
// Notifications API
// =======================

export const notificationsApi = {
  getAll: () =>
    apiFetch("/notifications"),

  markAsRead: (id) =>
    apiFetch(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiFetch("/notifications/read-all", {
      method: "PATCH",
    }),

  delete: (id) =>
    apiFetch(`/notifications/${id}`, {
      method: "DELETE",
    }),
};

// =======================
// Quotes API
// =======================

export const quotesApi = {
  submit: (bookingId, data) =>
    apiFetch(`/quotes/${bookingId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  respond: (bookingId, action) =>
    apiFetch(`/quotes/${bookingId}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),
};

// =======================
// Payments API
// =======================

export const paymentsApi = {
  initiate: (bookingId) =>
    apiFetch("/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ bookingId }),
    }),

  verify: (pidx, purchaseOrderId) =>
    apiFetch("/payments/verify", {
      method: "POST",
      body: JSON.stringify({ pidx, purchaseOrderId }),
    }),

  release: (bookingId) =>
    apiFetch(`/payments/release/${bookingId}`, {
      method: "POST",
    }),
};

// =======================
// Transactions API
// =======================

export const transactionsApi = {
  getProviderTransactions: () =>
    apiFetch("/transactions/provider"),

  getBookingTransactions: (bookingId) =>
    apiFetch(`/transactions/booking/${bookingId}`),
};

// =======================
// Catalog Services API
// =======================

export const catalogServicesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();

    return apiFetch(
      `/catalog-services${qs ? `?${qs}` : ""}`
    );
  },

  getById: (id) =>
    apiFetch(`/catalog-services/${id}`),

  getProviders: (id) =>
    apiFetch(`/catalog-services/${id}/providers`),
};

// =======================
// Service Requests API
// =======================

export const serviceRequestsApi = {
  create: (data) =>
    apiFetch("/service-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCustomerRequests: () =>
    apiFetch("/service-requests/customer"),

  getProviderRequests: () =>
    apiFetch("/service-requests/provider"),

  getById: (id) =>
    apiFetch(`/service-requests/${id}`),

  updateStatus: (id, status) =>
    apiFetch(`/service-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  requestInspection: (id) =>
    apiFetch(`/service-requests/${id}/inspection`, {
      method: "POST",
    }),

  scheduleInspection: (id, data) =>
    apiFetch(`/service-requests/${id}/inspection/schedule`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  completeInspection: (id, data) =>
    apiFetch(`/service-requests/${id}/inspection/complete`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  createOrUpdateQuote: (id, data) =>
    apiFetch(`/service-requests/${id}/quote`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  respondToQuote: (id, action) =>
    apiFetch(`/service-requests/${id}/quote/respond`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),

  confirmCompletion: (id) =>
    apiFetch(`/service-requests/${id}/confirm-completion`, {
      method: "PATCH",
    }),

  cancel: (id, reason) =>
    apiFetch(`/service-requests/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};

// =======================
// Provider Services API
// =======================

export const providerServicesApi = {
  getMyServices: () =>
    apiFetch("/provider-services"),

  addService: (data) =>
    apiFetch("/provider-services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateService: (id, data) =>
    apiFetch(`/provider-services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  removeService: (id) =>
    apiFetch(`/provider-services/${id}`, {
      method: "DELETE",
    }),
};

// =======================
// AI API
// =======================

export const aiApi = {
  match: (messages, userLocation = null) =>
    apiFetch("/ai/match", {
      method: "POST",
      body: JSON.stringify({ messages, userLocation }),
    }),
};