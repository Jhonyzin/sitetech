import axios from "axios";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

function resolveApiBaseUrl() {
  if (configuredApiBaseUrl) return configuredApiBaseUrl;

  if (typeof window !== "undefined" && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  }

  return "http://localhost:4000/api";
}

const apiBaseUrl = resolveApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
