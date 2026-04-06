import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // This is crucial for cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// // Add request interceptor to handle errors globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized (token expired)
//       localStorage.removeItem("userInfo");
//       window.location.href = "/auth";
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
