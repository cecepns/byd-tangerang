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
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from "../utils/api";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  linkUrl: "",
  position: "hero",
  isActive: true,
  sortOrder: 1,
  image: null
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(banner) {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      linkUrl: banner.linkUrl,
      position: banner.position,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
      image: null
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("linkUrl", form.linkUrl);
    fd.append("position", form.position);
    fd.append("isActive", String(form.isActive));
    fd.append("sortOrder", String(form.sortOrder));
    if (form.image) fd.append("image", form.image);

    try {
      if (editing) {
        await updateBanner(editing.id, fd);
      } else {
        await createBanner(fd);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await deleteBanner(id);
      await load();
    } catch (err) {
      alert("Gagal menghapus: " + (err.response?.data?.message || err.message));
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
            <span className="text-white">Banner Management</span>
          </div>
          <h1 className="text-2xl font-bold">Banner Management</h1>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Banner ({banners.length})
            </h2>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Banner
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-4 border-bydBlue/30 border-t-bydBlue rounded-full animate-spin" />
            </div>
          ) : banners.length === 0 ? (
            <p className="text-center text-slate-400 py-16 text-sm">
              Belum ada banner. Klik &quot;Tambah Banner&quot; untuk membuat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Preview
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Judul
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Posisi
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Order
                    </th>
                    <th className="py-3 font-semibold text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {banners.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        {b.imageUrl ? (
                          <img
                            src={`https://api-inventory.isavralabel.com/byd-tangerang${b.imageUrl}`}
                            alt={b.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-12 bg-slate-100 rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-slate-300" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{b.title}</p>
                        <p className="text-xs text-slate-400">{b.subtitle}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-block px-2 py-1 rounded bg-bydBlue/10 text-bydBlue text-xs font-medium">
                          {b.position}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            b.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {b.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {b.sortOrder}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-bydBlue transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold">
                {editing ? "Edit Banner" : "Tambah Banner"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtitle: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkUrl: e.target.value }))
                  }
                  placeholder="/produk"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Posisi
                  </label>
                  <select
                    value={form.position}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, position: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  >
                    <option value="hero">Hero</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        sortOrder: Number(e.target.value)
                      }))
                    }
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-bydBlue focus:ring-bydBlue"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">
                  Aktif
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gambar Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      image: e.target.files[0] || null
                    }))
                  }
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bydBlue/10 file:text-bydBlue hover:file:bg-bydBlue/20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors"
                >
                  {editing ? "Simpan Perubahan" : "Tambah Banner"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
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
