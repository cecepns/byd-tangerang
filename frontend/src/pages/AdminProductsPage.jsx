import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  ImageIcon,
  Package
} from "lucide-react";
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../utils/api";

const defaultHighlights = { power: "", battery: "", range: "" };

const emptyProduct = () => ({
  name: "",
  slug: "",
  price: "",
  city: "",
  shortDescription: "",
  description: "",
  highlights: { ...defaultHighlights },
  specs: [],
  colors: [],
  exteriorMedia: [],
  interiorMedia: [],
  galleryMedia: []
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (e) {
      setError(e.response?.status === 401 ? "Sesi habis. Silakan login lagi." : "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyProduct());
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name || "",
      slug: p.slug || "",
      price: String(p.price || ""),
      city: p.city || "",
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      highlights: p.highlights
        ? { ...defaultHighlights, ...p.highlights }
        : { ...defaultHighlights },
      specs: Array.isArray(p.specs) ? p.specs.map((s) => ({ ...s })) : [],
      colors: Array.isArray(p.colors) ? p.colors.map((c) => ({ ...c })) : [],
      exteriorMedia: Array.isArray(p.exteriorMedia)
        ? p.exteriorMedia.map((m) => ({ ...m }))
        : [],
      interiorMedia: Array.isArray(p.interiorMedia)
        ? p.interiorMedia.map((m) => ({ ...m }))
        : [],
      galleryMedia: Array.isArray(p.galleryMedia)
        ? p.galleryMedia.map((m) => ({ ...m }))
        : []
    });
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  function addSpec() {
    setForm((f) => ({
      ...f,
      specs: [...f.specs, { label: "", value: "" }]
    }));
  }

  function updateSpec(i, field, value) {
    setForm((f) => {
      const s = [...f.specs];
      s[i] = { ...s[i], [field]: value };
      return { ...f, specs: s };
    });
  }

  function removeSpec(i) {
    setForm((f) => ({
      ...f,
      specs: f.specs.filter((_, idx) => idx !== i)
    }));
  }

  function addColor() {
    setForm((f) => ({
      ...f,
      colors: [...f.colors, { name: "", hex: "#000000" }]
    }));
  }

  function updateColor(i, field, value) {
    setForm((f) => {
      const c = [...f.colors];
      c[i] = { ...c[i], [field]: value };
      return { ...f, colors: c };
    });
  }

  function removeColor(i) {
    setForm((f) => ({
      ...f,
      colors: f.colors.filter((_, idx) => idx !== i)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price) || 0,
      city: form.city,
      shortDescription: form.shortDescription,
      description: form.description,
      highlights: form.highlights,
      specs: form.specs.filter((s) => s.label || s.value),
      colors: form.colors.filter((c) => c.name || c.hex || c.imageUrl),
      exteriorMedia: form.exteriorMedia || [],
      interiorMedia: form.interiorMedia || [],
      galleryMedia: form.galleryMedia || []
    };
    const fd = new FormData();
    fd.append("payload", JSON.stringify(payload));
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editing) {
        await updateProduct(editing.id, fd);
      } else {
        await createProduct(fd);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Gagal menyimpan produk"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Gagal menghapus produk"
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
            <Link to="/admin/products" className="hover:text-white transition-colors">
              Admin
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Manajemen Produk</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manajemen Produk</h1>
            <Link
              to="/admin/banners"
              className="text-sm text-bydLightBlue hover:text-white transition-colors"
            >
              Kelola Banner
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Produk ({products.length})
            </h2>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
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
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Belum ada produk.</p>
              <button
                onClick={openCreate}
                className="mt-3 text-bydBlue text-sm font-semibold hover:underline"
              >
                Tambah produk pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Produk
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Harga
                    </th>
                    <th className="py-3 pr-4 font-semibold text-slate-600">
                      Kota
                    </th>
                    <th className="py-3 font-semibold text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={`https://api-inventory.isavralabel.com/byd-tangerang${p.imageUrl}`}
                              alt={p.name}
                              className="w-14 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-14 h-10 bg-slate-100 rounded flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        IDR {Number(p.price).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 pr-4">{p.city || "-"}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link
                            to={`/produk/${p.slug}`}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-bydBlue transition-colors text-xs"
                          >
                            Lihat
                          </Link>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-bydBlue transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
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
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold">
                {editing ? "Edit Produk" : "Tambah Produk"}
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
                    Nama *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="byd-atto-1"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Harga *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
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
                    placeholder="Jakarta"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shortDescription: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Highlights (Daya, Baterai, Jangkauan)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["power", "battery", "range"].map((key) => (
                    <input
                      key={key}
                      type="text"
                      value={form.highlights[key] || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          highlights: {
                            ...f.highlights,
                            [key]: e.target.value
                          }
                        }))
                      }
                      placeholder={
                        key === "power"
                          ? "75 PS"
                          : key === "battery"
                            ? "44.9 kWh"
                            : "405 km"
                      }
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30"
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Spesifikasi
                  </label>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="text-xs text-bydBlue font-medium hover:underline"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {form.specs.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={s.label}
                        onChange={(e) =>
                          updateSpec(i, "label", e.target.value)
                        }
                        placeholder="Label"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={s.value}
                        onChange={(e) =>
                          updateSpec(i, "value", e.target.value)
                        }
                        placeholder="Value"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="p-2 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Warna
                  </label>
                  <button
                    type="button"
                    onClick={addColor}
                    className="text-xs text-bydBlue font-medium hover:underline"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {form.colors.map((c, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={c.hex || "#000000"}
                          onChange={(e) =>
                            updateColor(i, "hex", e.target.value)
                          }
                          className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={c.name || ""}
                          onChange={(e) =>
                            updateColor(i, "name", e.target.value)
                          }
                          placeholder="Nama warna"
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeColor(i)}
                          className="p-2 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.imageUrl && (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="w-10 h-10 rounded object-cover border border-slate-200"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            fetch("/api/uploads", {
                              method: "POST",
                              body: fd
                            })
                              .then((r) => r.json())
                              .then((res) => {
                                if (res?.url) {
                                  updateColor(i, "imageUrl", res.url);
                                }
                              })
                              .catch(() => {});
                          }}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-bydBlue/10 file:text-bydBlue"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Media Eksterior
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.exteriorMedia.map((m, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={m.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          exteriorMedia: f.exteriorMedia.filter(
                            (_x, i) => i !== idx
                          )
                        }))
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => {
                    const fd = new FormData();
                    fd.append("file", file);
                    fetch("/api/uploads", {
                      method: "POST",
                      body: fd
                    })
                      .then((r) => r.json())
                      .then((res) => {
                        if (res?.url) {
                          setForm((f) => ({
                            ...f,
                            exteriorMedia: [
                              ...f.exteriorMedia,
                              { url: res.url }
                            ]
                          }));
                        }
                      })
                      .catch(() => {});
                  });
                }}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bydBlue/10 file:text-bydBlue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Media Interior
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.interiorMedia.map((m, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={m.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          interiorMedia: f.interiorMedia.filter(
                            (_x, i) => i !== idx
                          )
                        }))
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => {
                    const fd = new FormData();
                    fd.append("file", file);
                    fetch("/api/uploads", {
                      method: "POST",
                      body: fd
                    })
                      .then((r) => r.json())
                      .then((res) => {
                        if (res?.url) {
                          setForm((f) => ({
                            ...f,
                            interiorMedia: [
                              ...f.interiorMedia,
                              { url: res.url }
                            ]
                          }));
                        }
                      })
                      .catch(() => {});
                  });
                }}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bydBlue/10 file:text-bydBlue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Media Gallery
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.galleryMedia.map((m, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={m.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          galleryMedia: f.galleryMedia.filter(
                            (_x, i) => i !== idx
                          )
                        }))
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => {
                    const fd = new FormData();
                    fd.append("file", file);
                    fetch("/api/uploads", {
                      method: "POST",
                      body: fd
                    })
                      .then((r) => r.json())
                      .then((res) => {
                        if (res?.url) {
                          setForm((f) => ({
                            ...f,
                            galleryMedia: [
                              ...f.galleryMedia,
                              { url: res.url }
                            ]
                          }));
                        }
                      })
                      .catch(() => {});
                  });
                }}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bydBlue/10 file:text-bydBlue"
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gambar Produk
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bydBlue/10 file:text-bydBlue"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Produk"}
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
