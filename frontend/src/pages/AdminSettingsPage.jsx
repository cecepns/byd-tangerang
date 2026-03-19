import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { fetchSettings, updateSettings } from "../utils/api";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footer, setFooter] = useState({
    tagline: "",
    address: "",
    phone: "",
    email: "",
    jamKerjaHeadOffice: "",
    jamKerjaCabang: "",
    links: [],
    socialMedia: [],
    copyrightText: "",
    footerRightText: "",
    whatsappNumber: ""
  });

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data?.footer) setFooter(data.footer);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setFooterField(field, value) {
    setFooter((prev) => ({ ...prev, [field]: value }));
  }

  function setLink(index, key, value) {
    setFooter((prev) => {
      const links = [...(prev.links || [])];
      if (!links[index]) links[index] = { label: "", url: "" };
      links[index] = { ...links[index], [key]: value };
      return { ...prev, links };
    });
  }

  function addLink() {
    setFooter((prev) => ({
      ...prev,
      links: [...(prev.links || []), { label: "", url: "" }]
    }));
  }

  function removeLink(i) {
    setFooter((prev) => ({
      ...prev,
      links: (prev.links || []).filter((_, idx) => idx !== i)
    }));
  }

  function setSocial(index, key, value) {
    setFooter((prev) => {
      const arr = [...(prev.socialMedia || [])];
      if (!arr[index]) arr[index] = { label: "", url: "" };
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, socialMedia: arr };
    });
  }

  function addSocial() {
    setFooter((prev) => ({
      ...prev,
      socialMedia: [...(prev.socialMedia || []), { label: "", url: "" }]
    }));
  }

  function removeSocial(i) {
    setFooter((prev) => ({
      ...prev,
      socialMedia: (prev.socialMedia || []).filter((_, idx) => idx !== i)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({ footer });
      alert("Settings berhasil disimpan.");
    } catch (err) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Memuat settings…
      </div>
    );
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
            <span className="text-white">Pengaturan</span>
          </div>
          <h1 className="text-2xl font-bold">Pengaturan Situs (Footer)</h1>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-xl max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Brand & Kontak
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tagline (teks di bawah logo)
                  </label>
                  <input
                    type="text"
                    value={footer.tagline || ""}
                    onChange={(e) => setFooterField("tagline", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alamat (baris baru = Enter)
                  </label>
                  <textarea
                    value={footer.address || ""}
                    onChange={(e) => setFooterField("address", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Telepon
                    </label>
                    <input
                      type="text"
                      value={footer.phone || ""}
                      onChange={(e) => setFooterField("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={footer.email || ""}
                      onChange={(e) => setFooterField("email", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Jam Kerja
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Head Office
                  </label>
                  <input
                    type="text"
                    value={footer.jamKerjaHeadOffice || ""}
                    onChange={(e) =>
                      setFooterField("jamKerjaHeadOffice", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cabang
                  </label>
                  <input
                    type="text"
                    value={footer.jamKerjaCabang || ""}
                    onChange={(e) =>
                      setFooterField("jamKerjaCabang", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Links</h2>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1 text-sm text-bydBlue hover:underline"
                >
                  <Plus className="h-4 w-4" /> Tambah
                </button>
              </div>
              <div className="space-y-3">
                {(footer.links || []).map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label"
                      value={item.label || ""}
                      onChange={(e) => setLink(i, "label", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. / atau #)"
                      value={item.url || ""}
                      onChange={(e) => setLink(i, "url", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Social Media
                </h2>
                <button
                  type="button"
                  onClick={addSocial}
                  className="flex items-center gap-1 text-sm text-bydBlue hover:underline"
                >
                  <Plus className="h-4 w-4" /> Tambah
                </button>
              </div>
              <div className="space-y-3">
                {(footer.socialMedia || []).map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label"
                      value={item.label || ""}
                      onChange={(e) => setSocial(i, "label", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={item.url || ""}
                      onChange={(e) => setSocial(i, "url", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSocial(i)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Baris Bawah & WhatsApp
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teks Copyright (pakai {"{year}"} untuk tahun)
                  </label>
                  <input
                    type="text"
                    value={footer.copyrightText || ""}
                    onChange={(e) =>
                      setFooterField("copyrightText", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teks Kanan Bawah
                  </label>
                  <input
                    type="text"
                    value={footer.footerRightText || ""}
                    onChange={(e) =>
                      setFooterField("footerRightText", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nomor WhatsApp (floating button, contoh: 6282112345678)
                  </label>
                  <input
                    type="text"
                    value={footer.whatsappNumber || ""}
                    onChange={(e) =>
                      setFooterField("whatsappNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="6282112345678"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-bydBlue text-white font-medium text-sm hover:bg-bydBlue/90 disabled:opacity-50"
              >
                {saving ? "Menyimpan…" : "Simpan Pengaturan"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
