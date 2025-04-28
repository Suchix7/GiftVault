import axios from "axios";

const API_URL = "/vouchers";

// Create voucher
const createVoucher = async (voucherData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };

  const response = await axios.post(API_URL, voucherData, config);
  return response.data;
};

// Get vouchers
const getVouchers = async (params, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };
  console.log(token);
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Update voucher
const updateVoucher = async (voucherId, voucherData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log(voucherId, voucherData, token);

  const response = await axios.patch(
    `${API_URL}/${voucherId}`,
    voucherData,
    config
  );
  return response.data;
};

// Delete voucher
const deleteVoucher = async (voucherId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}/${voucherId}`, config);
  return response.data;
};
// Update voucher status
const updateVoucherStatus = async (voucherId, status, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    `${API_URL}/${voucherId}/status`,
    { status },
    config
  );
  return response.data;
};

const voucherService = {
  createVoucher,
  getVouchers,
  updateVoucher,
  deleteVoucher,
  updateVoucherStatus,
};

export default voucherService;
