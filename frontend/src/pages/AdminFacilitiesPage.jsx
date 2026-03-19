import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  ImageIcon
} from "lucide-react";
import {
  fetchAdminFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  getImageUrl
} from "../utils/api";

const emptyFacility = () => ({
  key: "",
  label: "",
  description: "",
  isActive: true,
  sortOrder: ""
});

export default function AdminFacilitiesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyFacility());
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminFacilities();
      setItems(data);
    } catch (e) {
      setError(
        e.response?.status === 401
          ? "Sesi habis. Silakan login lagi."
          : "Gagal memuat fasilitas dealer."
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
    setForm(emptyFacility());
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      key: item.key || "",
      label: item.label || "",
      description: item.description || "",
      isActive: !!item.isActive,
      sortOrder: item.sortOrder ? String(item.sortOrder) : ""
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
      key: form.key,
      label: form.label,
      description: form.description,
      isActive: !!form.isActive,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : 0
    };

    const fd = new FormData();
    fd.append("payload", JSON.stringify(payload));
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editing) {
        await updateFacility(editing.id, fd);
      } else {
        await createFacility(fd);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan fasilitas"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Hapus fasilitas "${item.label}"?`)) return;
    try {
      await deleteFacility(item.id);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghapus fasilitas"
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
            <span className="text-white">Fasilitas Dealer</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Fasilitas Dealer (Home)</h1>
            <span className="text-sm text-bydLightBlue">
              Pengaturan konten section &quot;Fasilitas Dealer&quot; di halaman utama
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Fasilitas ({items.length})
            </h2>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Fasilitas
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
              <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                Belum ada data fasilitas dealer.
              </p>
              <button
                onClick={openCreate}
                className="mt-3 text-bydBlue text-sm font-semibold hover:underline"
              >
                Tambah fasilitas pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Fasilitas
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Key
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
                  {items.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {f.imageUrl ? (
                            <img
                              src={getImageUrl(f.imageUrl)}
                              alt={f.label}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{f.label}</p>
                            {f.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 max-w-xs">
                                {f.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-500">
                        {f.key}
                      </td>
                      <td className="py-3 pr-4">{f.sortOrder ?? 0}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            f.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {f.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(f)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-bydBlue transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(f)}
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
                {editing ? "Edit Fasilitas" : "Tambah Fasilitas"}
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
                    Key (unik) *
                  </label>
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, key: e.target.value }))
                    }
                    required
                    placeholder="fasilitas, waiting, charger..."
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Label Tab *
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, label: e.target.value }))
                    }
                    required
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="facility-active"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-bydBlue focus:ring-bydBlue/40"
                  />
                  <label
                    htmlFor="facility-active"
                    className="text-sm text-slate-700"
                  >
                    Tampilkan di section Fasilitas Dealer
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gambar Fasilitas
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
                  Opsional namun disarankan. Upload gambar baru untuk mengganti
                  gambar yang sudah ada.
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
                      : "Tambah Fasilitas"}
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

