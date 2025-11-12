import axios from "axios";

// Replace 'localhost' with your IP address (e.g., '192.168.1.100') for network access
// Keep as 'localhost' for local testing only
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// For sending JWT token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
