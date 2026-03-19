import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../components/Layout/PublicLayout";
import AdminLayout from "../components/Layout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "./HomePage";
import ProductsPage from "./ProductsPage";
import ProductDetailPage from "./ProductDetailPage";
import LoginPage from "./LoginPage";
import AdminProductsPage from "./AdminProductsPage";
import AdminBannersPage from "./AdminBannersPage";
import AdminFacilitiesPage from "./AdminFacilitiesPage";
import AdminTestimonialsPage from "./AdminTestimonialsPage";
import AdminSettingsPage from "./AdminSettingsPage";
import AdminDealersPage from "./AdminDealersPage";
import DealersPage from "./DealersPage";

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="facilities" element={<AdminFacilitiesPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="dealers" element={<AdminDealersPage />} />
        </Route>

        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="produk" element={<ProductsPage />} />
          <Route path="produk/:slug" element={<ProductDetailPage />} />
          <Route path="dealer" element={<DealersPage />} />
        </Route>
      </Routes>
    </div>
  );
}
