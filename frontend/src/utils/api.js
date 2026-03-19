import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api-inventory.isavralabel.com/byd-tangerang/api";
const AUTH_TOKEN_KEY = "byd_admin_token";

/** Base URL untuk uploads (tanpa /api). Dipakai untuk gambar produk, banner, dll. */
export const UPLOADS_BASE_URL =
  (API_BASE_URL || "").replace(/\/api\/?$/, "") || "https://api-inventory.isavralabel.com/byd-tangerang";

/**
 * Mengembalikan URL lengkap untuk gambar upload (produk, banner).
 * @param {string | null | undefined} path - Path dari API, e.g. "/uploads-byd/media-xxx.webp"
 * @returns {string} URL lengkap atau "" jika path kosong
 */
export function getImageUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${UPLOADS_BASE_URL}${path}`;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
      }
    }
    return Promise.reject(err);
  }
);

export const endpoints = {
  products: "/products",
  productDetail: (id) => `/products/${id}`,
  productBySlug: (slug) => `/products/slug/${slug}`,
  banners: "/banners",
  bannerDetail: (id) => `/banners/${id}`,
  uploadMedia: "/uploads",
  settings: "/settings",
  adminSettings: "/admin/settings",
  dealers: "/dealers",
  dealerDetail: (id) => `/dealers/${id}`,
  adminDealers: "/admin/dealers",
  adminDealerDetail: (id) => `/admin/dealers/${id}`,
  facilities: "/facilities",
  adminFacilities: "/admin/facilities",
  adminFacilityDetail: (id) => `/admin/facilities/${id}`,
  testimonials: "/testimonials",
  testimonialDetail: (id) => `/testimonials/${id}`,
  adminTestimonials: "/admin/testimonials",
  adminTestimonialDetail: (id) => `/admin/testimonials/${id}`,
  auth: {
    login: "/auth/login",
    logout: "/auth/logout"
  },
  adminProducts: "/admin/products",
  adminProductDetail: (id) => `/admin/products/${id}`
};

export async function fetchProducts(params = {}) {
  const res = await apiClient.get(endpoints.products, { params });
  return res.data;
}

export async function fetchProductDetail(id) {
  const res = await apiClient.get(endpoints.productDetail(id));
  return res.data;
}

export async function fetchProductBySlug(slug) {
  const res = await apiClient.get(endpoints.productBySlug(slug));
  return res.data;
}

export async function fetchBanners(params = {}) {
  const res = await apiClient.get(endpoints.banners, { params });
  return res.data;
}

export async function createBanner(formData) {
  const res = await apiClient.post(endpoints.banners, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function updateBanner(id, formData) {
  const res = await apiClient.put(endpoints.bannerDetail(id), formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function deleteBanner(id) {
  const res = await apiClient.delete(endpoints.bannerDetail(id));
  return res.data;
}

export async function login(email, password) {
  const res = await apiClient.post(endpoints.auth.login, { email, password });
  return res.data;
}

export async function logout() {
  await apiClient.post(endpoints.auth.logout);
}

export async function fetchAdminProducts() {
  const res = await apiClient.get(endpoints.adminProducts);
  return res.data;
}

export async function createProduct(formData) {
  const res = await apiClient.post(endpoints.adminProducts, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function updateProduct(id, formData) {
  const res = await apiClient.put(endpoints.adminProductDetail(id), formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function deleteProduct(id) {
  const res = await apiClient.delete(endpoints.adminProductDetail(id));
  return res.data;
}

export async function fetchSettings() {
  const res = await apiClient.get(endpoints.settings);
  return res.data;
}

export async function updateSettings(payload) {
  const res = await apiClient.put(endpoints.adminSettings, payload);
  return res.data;
}

export async function fetchDealers(params = {}) {
  const res = await apiClient.get(endpoints.dealers, { params });
  return res.data;
}

export async function fetchDealerDetail(id) {
  const res = await apiClient.get(endpoints.dealerDetail(id));
  return res.data;
}

export async function fetchAdminDealers() {
  const res = await apiClient.get(endpoints.adminDealers);
  return res.data;
}

export async function createDealer(data) {
  const res = await apiClient.post(endpoints.adminDealers, data);
  return res.data;
}

export async function updateDealer(id, data) {
  const res = await apiClient.put(endpoints.adminDealerDetail(id), data);
  return res.data;
}

export async function deleteDealer(id) {
  const res = await apiClient.delete(endpoints.adminDealerDetail(id));
  return res.data;
}

export async function fetchFacilities() {
  const res = await apiClient.get(endpoints.facilities);
  return res.data;
}

export async function fetchAdminFacilities() {
  const res = await apiClient.get(endpoints.adminFacilities);
  return res.data;
}

export async function createFacility(formData) {
  const res = await apiClient.post(endpoints.adminFacilities, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function updateFacility(id, formData) {
  const res = await apiClient.put(endpoints.adminFacilityDetail(id), formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function deleteFacility(id) {
  const res = await apiClient.delete(endpoints.adminFacilityDetail(id));
  return res.data;
}

export async function fetchTestimonials() {
  const res = await apiClient.get(endpoints.testimonials);
  return res.data;
}

export async function fetchAdminTestimonials() {
  const res = await apiClient.get(endpoints.adminTestimonials);
  return res.data;
}

export async function createTestimonial(formData) {
  const res = await apiClient.post(endpoints.adminTestimonials, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function updateTestimonial(id, formData) {
  const res = await apiClient.put(
    endpoints.adminTestimonialDetail(id),
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
  return res.data;
}

export async function deleteTestimonial(id) {
  const res = await apiClient.delete(endpoints.adminTestimonialDetail(id));
  return res.data;
}
