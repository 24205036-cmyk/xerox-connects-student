import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('xeroxpress_token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    let message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    // If server returned an error JSON payload inside a Blob (common when responseType: 'blob')
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json?.message) message = json.message;
      } catch (_) {}
    }

    const customError = {
      message,
      status: error.response?.status,
      data: error.response?.data
    };
    return Promise.reject(customError);
  }
);

// Health Check API
export const checkHealth = async () => {
  return await api.get('/health');
};

// Auth APIs
export const authRegister = async (data) => {
  return await api.post('/auth/register', data);
};

export const authLogin = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const getMe = async () => {
  return await api.get('/auth/me');
};

// Student APIs
export const getStudentDashboard = async () => {
  return await api.get('/student/dashboard');
};

export const getStudentProfile = async () => {
  return await api.get('/student/profile');
};

export const updateStudentProfile = async (data) => {
  return await api.put('/student/profile', data);
};

// Orders & PDF APIs
export const uploadOrderFiles = async (formData) => {
  return await api.post('/orders/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getActiveStationery = async () => {
  return await api.get('/orders/stationery');
};
export const getStationery = getActiveStationery;

export const getPrintPrices = async () => {
  return await api.get('/orders/prices');
};

export const calculateOrderPrice = async (payload) => {
  return await api.post('/orders/calculate', payload);
};

export const createOrder = async (orderPayload) => {
  return await api.post('/orders', orderPayload);
};

// Razorpay Payment APIs
export const getRazorpayConfig = async () => {
  return await api.get('/payment/config');
};

export const createRazorpayOrder = async (orderPayload) => {
  return await api.post('/payment/create-order', orderPayload);
};

export const verifyRazorpayPayment = async (verificationPayload) => {
  return await api.post('/payment/verify', verificationPayload);
};

export const getStudentOrders = async (params = {}) => {
  return await api.get('/orders/history', { params });
};

export const getOrderHistory = async (page = 1, status = '') => {
  const params = { page };
  if (status) params.status = status;
  return await api.get('/orders/history', { params });
};

export const getStudentOrderDetail = async (orderId) => {
  return await api.get(`/orders/${orderId}`);
};
export const getOrderDetail = getStudentOrderDetail;

export const cancelStudentOrder = async (orderId) => {
  return await api.patch(`/orders/${orderId}/cancel`);
};

export const deleteDraftFile = async (storedFilename) => {
  return await api.delete(`/orders/upload/${storedFilename}`);
};

// Staff APIs
export const getStaffOrders = async (status = '', date = '') => {
  const params = {};
  if (status) params.status = status;
  if (date) params.date = date;
  return await api.get('/staff/orders', { params });
};

export const getStaffOrderDetail = async (orderId) => {
  return await api.get(`/staff/orders/${orderId}`);
};

export const updateOrderStatus = async (orderId, new_status) => {
  return await api.patch(`/staff/orders/${orderId}/status`, { new_status });
};

// Admin APIs
export const getAdminDashboard = async () => {
  return await api.get('/admin/dashboard');
};

export const getAdminUsers = async (params = {}) => {
  return await api.get('/admin/users', { params });
};

export const createAdminStaff = async (data) => {
  return await api.post('/admin/staff', data);
};

export const toggleAdminUserStatus = async (userId) => {
  return await api.patch(`/admin/users/${userId}/status`);
};

export const getAdminOrders = async (params = {}) => {
  return await api.get('/admin/orders', { params });
};

export const getAdminStationery = async () => {
  return await api.get('/admin/stationery');
};

export const createAdminStationery = async (data) => {
  return await api.post('/admin/stationery', data);
};

export const updateAdminStationery = async (id, data) => {
  return await api.put(`/admin/stationery/${id}`, data);
};

export const toggleAdminStationeryStatus = async (id) => {
  return await api.patch(`/admin/stationery/${id}/status`);
};

export const getAdminPricing = async () => {
  return await api.get('/admin/pricing');
};

export const updateAdminPricing = async (prices) => {
  return await api.put('/admin/pricing', { prices });
};

export const getAdminSettings = async () => {
  return await api.get('/admin/settings');
};

export const updateAdminSettings = async (settings) => {
  return await api.put('/admin/settings', { settings });
};

export const getAdminReports = async () => {
  return await api.get('/admin/reports');
};

export const getAdminPayments = async (params = {}) => {
  return await api.get('/admin/payments', { params });
};

export const reviewExtraPayment = async (id, data) => {
  return await api.patch(`/admin/payments/${id}/review-extra`, data);
};

// Notification APIs
export const getNotifications = async () => {
  return await api.get('/notifications');
};

export const markNotificationAsRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await api.patch('/notifications/read-all');
};

// Document Converter APIs with dedicated extended timeout
export const convertPdfToWordApi = async (formData) => {
  return await api.post('/converter/pdf-to-word', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    timeout: 120000 // 2 minutes
  });
};

export const convertWordToPdfApi = async (formData) => {
  return await api.post('/converter/word-to-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    timeout: 120000 // 2 minutes
  });
};

export default api;
