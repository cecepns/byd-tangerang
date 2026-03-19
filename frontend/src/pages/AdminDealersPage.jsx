import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import {
  fetchAdminDealers,
  createDealer,
  updateDealer,
  deleteDealer
} from "../utils/api";

const EMPTY_FORM = {
  name: "",
  address: "",
  city: "",
  province: "",
  phone: "",
  email: "",
  mapUrl: "",
  isActive: true,
  sortOrder: 0
};

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminDealers();
      setDealers(data);
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
    setForm({
      ...EMPTY_FORM,
      sortOrder: dealers.length + 1
    });
    setShowForm(true);
  }

  function openEdit(d) {
    setEditing(d);
    setForm({
      name: d.name || "",
      address: d.address || "",
      city: d.city || "",
      province: d.province || "",
      phone: d.phone || "",
      email: d.email || "",
      mapUrl: d.mapUrl || "",
      isActive: d.isActive !== false,
      sortOrder: d.sortOrder ?? 0
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateDealer(editing.id, form);
      } else {
        await createDealer(form);
      }
      closeForm();
      await load();
    } catch (err) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus dealer ini?")) return;
    try {
      await deleteDealer(id);
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
            <span className="text-white">Manajemen Dealer</span>
          </div>
          <h1 className="text-2xl font-bold">Manajemen Dealer</h1>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-xl">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-slate-600">
              Daftar dealer yang tampil di halaman publik.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bydBlue text-white text-sm font-medium hover:bg-bydBlue/90"
            >
              <Plus className="h-4 w-4" /> Tambah Dealer
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">
              Memuat…
            </div>
          ) : dealers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 rounded-xl border border-slate-200">
              Belum ada dealer. Klik &quot;Tambah Dealer&quot; untuk menambah.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-3 pr-4">No</th>
                    <th className="pb-3 pr-4">Nama</th>
                    <th className="pb-3 pr-4">Kota</th>
                    <th className="pb-3 pr-4">Telepon</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.map((d, i) => (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                      <td className="py-3 pr-4 font-medium">{d.name}</td>
                      <td className="py-3 pr-4">{d.city}</td>
                      <td className="py-3 pr-4">{d.phone || "—"}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            d.isActive
                              ? "text-green-600"
                              : "text-slate-400"
                          }
                        >
                          {d.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(d)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? "Edit Dealer" : "Tambah Dealer"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Dealer *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alamat
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={form.province}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, province: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Peta (Google Maps URL, opsional)
                </label>
                <input
                  type="url"
                  value={form.mapUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mapUrl: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">
                  Tampilkan di halaman dealer
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Urutan (angka)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: Number(e.target.value) || 0
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-bydBlue text-white text-sm font-medium hover:bg-bydBlue/90"
                >
                  {editing ? "Simpan" : "Tambah"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50"
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
