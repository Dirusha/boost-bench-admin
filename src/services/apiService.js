// src/services/apiService.js
const BASE_URL = "http://localhost:9000"; // Replace with your {{base_url}}

const fetchWithErrorHandling = async (url, options) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Request failed");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const apiService = {
  get: (url, options = {}) =>
    fetchWithErrorHandling(url, {
      method: "GET",
      ...options,
    }),
  post: (url, data, options = {}) =>
    fetchWithErrorHandling(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(data),
      ...options,
    }),
  put: (url, data, options = {}) =>
    fetchWithErrorHandling(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(data),
      ...options,
    }),
  delete: (url, options = {}) =>
    fetchWithErrorHandling(url, {
      method: "DELETE",
      ...options,
    }),
};

export default apiService;
