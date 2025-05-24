import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    const token = user?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Create voucher
const createVoucher = async (voucherData) => {
  try {
    const response = await api.post("/vouchers", voucherData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating voucher:", error);
    throw error.response?.data || error;
  }
};

// Get vouchers
const getVouchers = async (params) => {
  try {
    const response = await api.get("/vouchers", { params });
    return response.data.success ? response.data.vouchers : [];
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return [];
  }
};

// Update voucher
const updateVoucher = async (voucherId, voucherData) => {
  try {
    const response = await api.patch(`/vouchers/${voucherId}`, voucherData);
    return response.data.voucher;
  } catch (error) {
    console.error("Error updating voucher:", error);
    throw error.response?.data || error;
  }
};

// Delete voucher
const deleteVoucher = async (voucherId) => {
  try {
    const response = await api.delete(`/vouchers/${voucherId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting voucher:", error);
    throw error.response?.data || error;
  }
};

// Get all active vouchers (public)
const getActiveVouchers = async () => {
  try {
    const response = await api.get("/vouchers/public/active");
    return response.data.vouchers || [];
  } catch (error) {
    console.error("Error fetching active vouchers:", error);
    return [];
  }
};

// Redeem voucher
const redeemVoucher = async (voucherId) => {
  try {
    const response = await api.post(`/vouchers/${voucherId}/redeem`);
    return response.data;
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    throw error.response?.data || error;
  }
};

// Find voucher by code
const findVoucherByCode = async (code) => {
  try {
    const response = await api.post(`/vouchers/find-by-code`, {
      voucherCode: code,
    });
    return response.data;
  } catch (error) {
    console.error("Error finding voucher:", error);
    throw error.response?.data || error;
  }
};

// Complete voucher redemption
const completeRedemption = async (data) => {
  try {
    const response = await api.post(`/vouchers/redeem/complete`, data);
    return response.data;
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    throw error.response?.data || error;
  }
};

const voucherService = {
  createVoucher,
  getVouchers,
  updateVoucher,
  deleteVoucher,
  getActiveVouchers,
  redeemVoucher,
  findVoucherByCode,
  completeRedemption,
};

export default voucherService;
