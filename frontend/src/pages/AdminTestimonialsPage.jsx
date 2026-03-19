import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  ImageIcon,
  MessageCircle
} from "lucide-react";
import {
  fetchAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getImageUrl
} from "../utils/api";

const emptyTestimonial = () => ({
  customerName: "",
  city: "",
  title: "",
  message: "",
  rating: "",
  isActive: true,
  sortOrder: ""
});

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTestimonial());
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminTestimonials();
      setItems(data);
    } catch (e) {
      setError(
        e.response?.status === 401
          ? "Sesi habis. Silakan login lagi."
          : "Gagal memuat testimoni."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyTestimonial());
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(t) {
    setEditing(t);
    setForm({
      customerName: t.customerName || "",
      city: t.city || "",
      title: t.title || "",
      message: t.message || "",
      rating: t.rating ? String(t.rating) : "",
      isActive: !!t.isActive,
      sortOrder: t.sortOrder ? String(t.sortOrder) : ""
    });
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      customerName: form.customerName,
      city: form.city,
      title: form.title,
      message: form.message,
      rating: form.rating ? Number(form.rating) : null,
      isActive: !!form.isActive,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : 0
    };

    const fd = new FormData();
    fd.append("payload", JSON.stringify(payload));
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editing) {
        await updateTestimonial(editing.id, fd);
      } else {
        await createTestimonial(fd);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan testimoni"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    if (!confirm(`Hapus testimoni dari "${t.customerName}"?`)) return;
    try {
      await deleteTestimonial(t.id);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghapus testimoni"
      );
    }
  }

  return (
    <>
      <section className="bg-bydBlue text-white">
        <div className="container-xl py-8">
          <div className="flex items-center gap-2 text-sm text-bydLightBlue mb-3">
            <Link to="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              to="/admin/products"
              className="hover:text-white transition-colors"
            >
              Admin
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Manajemen Testimoni</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manajemen Testimoni</h1>
            <Link
              to="/admin/products"
              className="text-sm text-bydLightBlue hover:text-white transition-colors"
            >
              Kembali ke Produk
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Testimoni ({items.length})
            </h2>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Testimoni
            </button>
          </div>

          {error && !showForm && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-4 border-bydBlue/30 border-t-bydBlue rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                Belum ada testimoni pelanggan.
              </p>
              <button
                onClick={openCreate}
                className="mt-3 text-bydBlue text-sm font-semibold hover:underline"
              >
                Tambah testimoni pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Pelanggan
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Kota
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Rating
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Urutan
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="py-3 font-semibold text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {t.imageUrl ? (
                            <img
                              src={getImageUrl(t.imageUrl)}
                              alt={t.customerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {t.customerName || "Customer BYD"}
                            </p>
                            {t.title && (
                              <p className="text-xs text-slate-400 truncate max-w-xs">
                                {t.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{t.city || "-"}</td>
                      <td className="py-3 pr-4">
                        {typeof t.rating === "number" && t.rating > 0
                          ? `${t.rating}/5`
                          : "-"}
                      </td>
                      <td className="py-3 pr-4">{t.sortOrder ?? 0}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            t.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {t.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(t)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-bydBlue transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold">
                {editing ? "Edit Testimoni" : "Tambah Testimoni"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Pelanggan *
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        customerName: e.target.value
                      }))
                    }
                    required
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kota
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Judul Testimoni
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Misal: Biaya operasional jauh lebih hemat"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Isi Testimoni *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  required
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rating (1–5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, rating: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sortOrder: e.target.value }))
                    }
                    placeholder="0"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-bydBlue focus:ring-bydBlue/40"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm text-slate-700"
                  >
                    Tampilkan di halaman utama
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Foto Customer
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bydBlue/10 file:text-bydBlue"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Opsional. Jika tidak diisi, avatar inisial huruf akan
                  digunakan.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : editing
                      ? "Simpan Perubahan"
                      : "Tambah Testimoni"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

