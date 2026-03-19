const express = require("express");
const multer = require("multer");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
// const { pool, testConnection } = require("./db.js");


dotenv.config();

const pool = mysql.createPool({
  host: "localhost",
  user: "isad8273_byd-tangerang",
  password: "isad8273_byd-tangerang",
  database: "isad8273_byd-tangerang",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    // eslint-disable-next-line no-console
    console.log("[DB] Koneksi MySQL OK");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[DB] Gagal konek ke MySQL:", err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

const uploadsDir = path.resolve("uploads-byd");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `media-${unique}${ext}`);
  }
});

const upload = multer({ storage });

async function safeUnlink(uploadUrl) {
  try {
    if (!uploadUrl || !String(uploadUrl).startsWith("/uploads-byd/")) return;
    const filePath = path.join(uploadsDir, path.basename(uploadUrl));
    await fs.promises.unlink(filePath);
  } catch {
    // ignore
  }
}


app.use("/uploads-byd", express.static(uploadsDir));

/* ------------------------------------------------------------------ */
/*  Helper: mapping DB <-> API                                        */
/* ------------------------------------------------------------------ */
function mapProductRow(row) {
  let highlights = null;
  let specs = [];
  let colors = [];
  let exteriorMedia = [];
  let interiorMedia = [];
  let galleryMedia = [];
  try {
    if (row.highlights_json) highlights = JSON.parse(row.highlights_json);
  } catch {
    highlights = null;
  }
  try {
    if (row.specs_json) specs = JSON.parse(row.specs_json);
  } catch {
    specs = [];
  }
  try {
    if (row.colors_json) colors = JSON.parse(row.colors_json);
  } catch {
    colors = [];
  }
  try {
    if (row.exterior_media_json)
      exteriorMedia = JSON.parse(row.exterior_media_json);
  } catch {
    exteriorMedia = [];
  }
  try {
    if (row.interior_media_json)
      interiorMedia = JSON.parse(row.interior_media_json);
  } catch {
    interiorMedia = [];
  }
  try {
    if (row.gallery_media_json) galleryMedia = JSON.parse(row.gallery_media_json);
  } catch {
    galleryMedia = [];
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price || 0),
    city: row.city || "",
    shortDescription: row.short_description || "",
    description: row.description || "",
    highlights,
    specs,
    colors,
    imageUrl: row.image_url || null,
    exteriorMedia,
    interiorMedia,
    galleryMedia
  };
}

function mapTestimonialRow(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    city: row.city || "",
    title: row.title || "",
    message: row.message,
    rating: row.rating ?? null,
    imageUrl: row.image_url || null,
    isActive: !!row.is_active,
    sortOrder: row.sort_order
  };
}

function mapBannerRow(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || "",
    imageUrl: row.image_url || null,
    linkUrl: row.link_url || "",
    position: row.position || "hero",
    isActive: !!row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at
  };
}

function mapFacilityRow(row) {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description || "",
    imageUrl: row.image_url || null,
    isActive: !!row.is_active,
    sortOrder: row.sort_order
  };
}


async function ensureSeedTestimonials() {
  // Disengaja dikosongkan: testimonials sekarang sepenuhnya dikelola dari database/admin.
}

/* ------------------------------------------------------------------ */
/*  Banner Data (MySQL)                                               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Auth (in-memory tokens)                                             */
/* ------------------------------------------------------------------ */
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "admin@byd.local";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "admin123";

const validTokens = new Set();

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

/* ------------------------------------------------------------------ */
/*  Routes — Health                                                    */
/* ------------------------------------------------------------------ */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

/* ------------------------------------------------------------------ */
/*  Routes — Products (MySQL)                                         */
/* ------------------------------------------------------------------ */
app.get("/api/products", async (req, res) => {
  try {
    const { city } = req.query;
    let sql = "SELECT * FROM products";
    const params = [];
    if (city) {
      sql += " WHERE LOWER(city) = LOWER(?)";
      params.push(String(city));
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(mapProductRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/products error:", err.message);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/products/slug/:slug", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE slug = ?", [
      req.params.slug
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Product not found" });
    res.json(mapProductRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/products/slug/:slug error:", err.message);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Product not found" });
    res.json(mapProductRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/products/:id error:", err.message);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

/* ------------------------------------------------------------------ */
/*  Routes — Auth                                                      */
/* ------------------------------------------------------------------ */
app.post("/api/auth/login", express.json(), (req, res) => {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token =
      "tk_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 12);
    validTokens.add(token);
    return res.json({ token, user: { email: ADMIN_EMAIL } });
  }
  res.status(401).json({ message: "Email atau password salah" });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
  if (token) validTokens.delete(token);
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/*  Routes — Admin Products (protected, MySQL)                        */
/* ------------------------------------------------------------------ */
function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

app.get("/api/admin/products", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM products ORDER BY id ASC"
    );
    res.json(rows.map(mapProductRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/admin/products error:", err.message);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.post(
  "/api/admin/products",
  requireAuth,
  upload.single("image"),
  express.json(),
  async (req, res) => {
    try {
      const body = req.body || {};
      let payload = {};
      try {
        payload =
          typeof body.payload === "string"
            ? JSON.parse(body.payload)
            : body;
      } catch {
        payload = body;
      }

      const name = payload.name || "Produk Baru";
      const slug =
        payload.slug || slugify(name);

      const highlights = payload.highlights || {
        power: "",
        battery: "",
        range: ""
      };
      const specs = Array.isArray(payload.specs) ? payload.specs : [];
      const colors = Array.isArray(payload.colors) ? payload.colors : [];
      const exteriorMedia = Array.isArray(payload.exteriorMedia)
        ? payload.exteriorMedia
        : [];
      const interiorMedia = Array.isArray(payload.interiorMedia)
        ? payload.interiorMedia
        : [];
      const galleryMedia = Array.isArray(payload.galleryMedia)
        ? payload.galleryMedia
        : [];

      const imageUrl = req.file ? `/uploads-byd/${req.file.filename}` : null;

      const [result] = await pool.query(
        `INSERT INTO products
          (name, slug, price, city, short_description, description, highlights_json, specs_json, colors_json, image_url, exterior_media_json, interior_media_json, gallery_media_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          slug,
          Number(payload.price) || 0,
          payload.city || "",
          payload.shortDescription || "",
          payload.description || "",
          JSON.stringify(highlights),
          JSON.stringify(specs),
          JSON.stringify(colors),
          imageUrl,
          JSON.stringify(exteriorMedia),
          JSON.stringify(interiorMedia),
          JSON.stringify(galleryMedia)
        ]
      );

      const [rows] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [result.insertId]
      );
      res.status(201).json(mapProductRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("POST /api/admin/products error:", err.message);
      res.status(500).json({ message: "Failed to create product" });
    }
  }
);

app.put(
  "/api/admin/products/:id",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [existingRows] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];
      const body = req.body || {};
      let payload = {};
      try {
        payload =
          typeof body.payload === "string"
            ? JSON.parse(body.payload)
            : body;
      } catch {
        payload = body;
      }

      const fields = [];
      const params = [];

      if (payload.name !== undefined) {
        fields.push("name = ?");
        params.push(payload.name);
      }
      if (payload.slug !== undefined) {
        fields.push("slug = ?");
        params.push(payload.slug);
      }
      if (payload.price !== undefined) {
        fields.push("price = ?");
        params.push(Number(payload.price));
      }
      if (payload.city !== undefined) {
        fields.push("city = ?");
        params.push(payload.city);
      }
      if (payload.shortDescription !== undefined) {
        fields.push("short_description = ?");
        params.push(payload.shortDescription);
      }
      if (payload.description !== undefined) {
        fields.push("description = ?");
        params.push(payload.description);
      }
      if (payload.highlights !== undefined) {
        fields.push("highlights_json = ?");
        params.push(JSON.stringify(payload.highlights));
      }
      if (Array.isArray(payload.specs)) {
        fields.push("specs_json = ?");
        params.push(JSON.stringify(payload.specs));
      }
      if (Array.isArray(payload.colors)) {
        fields.push("colors_json = ?");
        params.push(JSON.stringify(payload.colors));
      }
      if (req.file) {
        fields.push("image_url = ?");
        params.push(`/uploads-byd/${req.file.filename}`);
      }
      if (Array.isArray(payload.exteriorMedia)) {
        fields.push("exterior_media_json = ?");
        params.push(JSON.stringify(payload.exteriorMedia));
      }
      if (Array.isArray(payload.interiorMedia)) {
        fields.push("interior_media_json = ?");
        params.push(JSON.stringify(payload.interiorMedia));
      }
      if (Array.isArray(payload.galleryMedia)) {
        fields.push("gallery_media_json = ?");
        params.push(JSON.stringify(payload.galleryMedia));
      }

      if (!fields.length) {
        if (!existing) {
          return res.status(404).json({ message: "Product not found" });
        }
        return res.json(mapProductRow(existing));
      }

      params.push(id);
      const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
      const [result] = await pool.query(sql, params);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const [rows] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );
      res.json(mapProductRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PUT /api/admin/products/:id error:", err.message);
      res.status(500).json({ message: "Failed to update product" });
    }
  }
);

app.delete("/api/admin/products/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }
    const row = rows[0];
    // cleanup images
    if (row.image_url) await safeUnlink(row.image_url);
    try {
      if (row.exterior_media_json) {
        const ext = JSON.parse(row.exterior_media_json);
        for (const m of ext || []) {
          if (m?.url) await safeUnlink(m.url);
        }
      }
    } catch {}
    try {
      if (row.interior_media_json) {
        const intr = JSON.parse(row.interior_media_json);
        for (const m of intr || []) {
          if (m?.url) await safeUnlink(m.url);
        }
      }
    } catch {}
    try {
      if (row.gallery_media_json) {
        const gal = JSON.parse(row.gallery_media_json);
        for (const m of gal || []) {
          if (m?.url) await safeUnlink(m.url);
        }
      }
    } catch {}
    try {
      if (row.colors_json) {
        const cols = JSON.parse(row.colors_json);
        for (const c of cols || []) {
          if (c?.imageUrl) await safeUnlink(c.imageUrl);
        }
      }
    } catch {}

    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json(mapProductRow(row));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /api/admin/products/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

/* ------------------------------------------------------------------ */
/*  Routes — Banners (MySQL)                                          */
/* ------------------------------------------------------------------ */
app.get("/api/banners", async (req, res) => {
  try {
    const { position, active } = req.query;
    let sql = "SELECT * FROM banners WHERE 1=1";
    const params = [];
    if (position) {
      sql += " AND position = ?";
      params.push(position);
    }
    if (active !== undefined) {
      sql += " AND is_active = ?";
      params.push(active === "true");
    }
    sql += " ORDER BY sort_order ASC, id ASC";
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(mapBannerRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/banners error:", err.message);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

app.get("/api/banners/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM banners WHERE id = ?", [
      Number(req.params.id)
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Banner not found" });
    res.json(mapBannerRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/banners/:id error:", err.message);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

app.post(
  "/api/banners",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, subtitle, linkUrl, position, isActive, sortOrder } =
        req.body || {};
      const imageUrl = req.file ? `/uploads-byd/${req.file.filename}` : null;
      const [result] = await pool.query(
        `INSERT INTO banners
          (title, subtitle, image_url, link_url, position, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title || "",
          subtitle || "",
          imageUrl,
          linkUrl || "",
          position || "hero",
          isActive === "true" || isActive === true,
          Number(sortOrder) || 0
        ]
      );
      const [rows] = await pool.query("SELECT * FROM banners WHERE id = ?", [
        result.insertId
      ]);
      res.status(201).json(mapBannerRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("POST /api/banners error:", err.message);
      res.status(500).json({ message: "Failed to create banner" });
    }
  }
);

app.put(
  "/api/banners/:id",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [existingRows] = await pool.query(
        "SELECT * FROM banners WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];
      const { title, subtitle, linkUrl, position, isActive, sortOrder } =
        req.body || {};
      const fields = [];
      const params = [];
      if (title !== undefined) {
        fields.push("title = ?");
        params.push(title);
      }
      if (subtitle !== undefined) {
        fields.push("subtitle = ?");
        params.push(subtitle);
      }
      if (linkUrl !== undefined) {
        fields.push("link_url = ?");
        params.push(linkUrl);
      }
      if (position !== undefined) {
        fields.push("position = ?");
        params.push(position);
      }
      if (isActive !== undefined) {
        fields.push("is_active = ?");
        params.push(isActive === "true" || isActive === true);
      }
      if (sortOrder !== undefined) {
        fields.push("sort_order = ?");
        params.push(Number(sortOrder));
      }
      let newImageUrl = existing?.image_url || null;
      if (req.file) {
        newImageUrl = `/uploads-byd/${req.file.filename}`;
        fields.push("image_url = ?");
        params.push(newImageUrl);
      }

      if (!fields.length) {
        const [rows] = await pool.query("SELECT * FROM banners WHERE id = ?", [
          id
        ]);
        if (!rows.length)
          return res.status(404).json({ message: "Banner not found" });
        return res.json(mapBannerRow(rows[0]));
      }

      params.push(id);
      const sql = `UPDATE banners SET ${fields.join(", ")} WHERE id = ?`;
      const [result] = await pool.query(sql, params);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Banner not found" });
      const [rows] = await pool.query("SELECT * FROM banners WHERE id = ?", [
        id
      ]);
      if (existing?.image_url && existing.image_url !== newImageUrl) {
        await safeUnlink(existing.image_url);
      }
      res.json(mapBannerRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PUT /api/banners/:id error:", err.message);
      res.status(500).json({ message: "Failed to update banner" });
    }
  }
);

app.delete("/api/banners/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query("SELECT * FROM banners WHERE id = ?", [
      id
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Banner not found" });
    await pool.query("DELETE FROM banners WHERE id = ?", [id]);
    await safeUnlink(rows[0].image_url);
    res.json(mapBannerRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /api/banners/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete banner" });
  }
});

/* ------------------------------------------------------------------ */
/*  Settings (footer & site — single object, persisted di MySQL)       */
/* ------------------------------------------------------------------ */
const defaultSettings = {
  footer: {
    tagline:
      "Terbaik dan Terpercaya dalam layanan penjualan dan purna jual BYD di Indonesia.",
    address: "Jl. Raya Kalimalang No. 19\nDuren Sawit, Jakarta Timur 13440",
    phone: "021-86601111",
    email: "info@arista-group.co.id",
    jamKerjaHeadOffice: "Senin – Jumat: 08.00 – 17.00",
    jamKerjaCabang: "Senin – Minggu: 08.00 – 18.00",
    links: [
      { label: "Beranda", url: "/" },
      { label: "Produk", url: "/produk" },
      { label: "Jaringan Dealer", url: "/dealer" },
      { label: "Promo", url: "#promotion" },
      { label: "Konsultasi Pembelian", url: "#" },
      { label: "Servis", url: "#" },
      { label: "Tentang Kami", url: "#about" }
    ],
    socialMedia: [
      { label: "@aristagroup.id", url: "#" },
      { label: "Arista Group", url: "#" },
      { label: "@aristagroup.id", url: "#" }
    ],
    copyrightText: "Copyright {year} © Arista. All rights reserved.",
    footerRightText: "BYD Indonesia Dealer Network",
    whatsappNumber: "6282100000000"
  }
};

let settings = JSON.parse(JSON.stringify(defaultSettings));

async function loadSettingsFromDb() {
  try {
    const [rows] = await pool.query(
      "SELECT `key`, value_json FROM settings WHERE `key` IN ('footer')"
    );
    const map = new Map();
    for (const r of rows) {
      map.set(r.key, r.value_json);
    }

    // Footer
    if (map.has("footer")) {
      const value = map.get("footer");
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      settings.footer = { ...settings.footer, ...parsed };
      // eslint-disable-next-line no-console
      console.log("[Settings] Footer settings loaded from MySQL.");
    } else {
      await pool.query(
        "INSERT INTO settings (`key`, value_json) VALUES (?, ?)",
        ["footer", JSON.stringify(settings.footer)]
      );
      // eslint-disable-next-line no-console
      console.log("[Settings] Default footer settings inserted into MySQL.");
    }

  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Settings] Failed to sync with MySQL:", err.message);
  }
}

app.get("/api/settings", async (_req, res) => {
  try {
    res.json(settings);
  } catch {
    res.json(settings);
  }
});

app.put("/api/admin/settings", requireAuth, express.json(), async (req, res) => {
  const body = req.body || {};
  if (body.footer) settings.footer = { ...settings.footer, ...body.footer };
  if (body.footer?.links) settings.footer.links = body.footer.links;
  if (body.footer?.socialMedia) settings.footer.socialMedia = body.footer.socialMedia;

  try {
    await pool.query(
      "INSERT INTO settings (`key`, value_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)",
      ["footer", JSON.stringify(settings.footer)]
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Settings] Failed to save to MySQL:", err.message);
  }

  res.json(settings);
});

/* ------------------------------------------------------------------ */
/*  Dealers (MySQL)                                                   */
/* ------------------------------------------------------------------ */
function mapDealerRow(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address || "",
    city: row.city || "",
    province: row.province || "",
    phone: row.phone || "",
    email: row.email || "",
    mapUrl: row.map_url || "",
    isActive: !!row.is_active,
    sortOrder: row.sort_order
  };
}

app.get("/api/dealers", async (req, res) => {
  try {
    const { city, active } = req.query;
    let sql = "SELECT * FROM dealers WHERE 1=1";
    const params = [];
    if (city) {
      sql += " AND LOWER(city) LIKE LOWER(?)";
      params.push(`%${String(city)}%`);
    }
    if (active !== undefined) {
      sql += " AND is_active = ?";
      params.push(active === "true");
    }
    sql += " ORDER BY sort_order ASC, id ASC";
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(mapDealerRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/dealers error:", err.message);
    res.status(500).json({ message: "Failed to fetch dealers" });
  }
});

app.get("/api/dealers/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM dealers WHERE id = ?", [
      Number(req.params.id)
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Dealer not found" });
    res.json(mapDealerRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/dealers/:id error:", err.message);
    res.status(500).json({ message: "Failed to fetch dealer" });
  }
});

app.get("/api/admin/dealers", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM dealers ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows.map(mapDealerRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/admin/dealers error:", err.message);
    res.status(500).json({ message: "Failed to fetch dealers" });
  }
});

app.post("/api/admin/dealers", requireAuth, express.json(), async (req, res) => {
  try {
    const body = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO dealers
        (name, address, city, province, phone, email, map_url, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name || "Dealer Baru",
        body.address || "",
        body.city || "",
        body.province || "",
        body.phone || "",
        body.email || "",
        body.mapUrl || "",
        body.isActive !== false,
        Number(body.sortOrder) || 0
      ]
    );
    const [rows] = await pool.query("SELECT * FROM dealers WHERE id = ?", [
      result.insertId
    ]);
    res.status(201).json(mapDealerRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/admin/dealers error:", err.message);
    res.status(500).json({ message: "Failed to create dealer" });
  }
});

app.put("/api/admin/dealers/:id", requireAuth, express.json(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const fields = [];
    const params = [];
    if (body.name !== undefined) {
      fields.push("name = ?");
      params.push(body.name);
    }
    if (body.address !== undefined) {
      fields.push("address = ?");
      params.push(body.address);
    }
    if (body.city !== undefined) {
      fields.push("city = ?");
      params.push(body.city);
    }
    if (body.province !== undefined) {
      fields.push("province = ?");
      params.push(body.province);
    }
    if (body.phone !== undefined) {
      fields.push("phone = ?");
      params.push(body.phone);
    }
    if (body.email !== undefined) {
      fields.push("email = ?");
      params.push(body.email);
    }
    if (body.mapUrl !== undefined) {
      fields.push("map_url = ?");
      params.push(body.mapUrl);
    }
    if (body.isActive !== undefined) {
      fields.push("is_active = ?");
      params.push(body.isActive);
    }
    if (body.sortOrder !== undefined) {
      fields.push("sort_order = ?");
      params.push(Number(body.sortOrder));
    }
    if (!fields.length) {
      const [rows] = await pool.query("SELECT * FROM dealers WHERE id = ?", [
        id
      ]);
      if (!rows.length)
        return res.status(404).json({ message: "Dealer not found" });
      return res.json(mapDealerRow(rows[0]));
    }
    params.push(id);
    const sql = `UPDATE dealers SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Dealer not found" });
    const [rows] = await pool.query("SELECT * FROM dealers WHERE id = ?", [
      id
    ]);
    res.json(mapDealerRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PUT /api/admin/dealers/:id error:", err.message);
    res.status(500).json({ message: "Failed to update dealer" });
  }
});

app.delete("/api/admin/dealers/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query("SELECT * FROM dealers WHERE id = ?", [
      id
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Dealer not found" });
    await pool.query("DELETE FROM dealers WHERE id = ?", [id]);
    res.json(mapDealerRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /api/admin/dealers/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete dealer" });
  }
});

/* ------------------------------------------------------------------ */
/*  Facilities (MySQL)                                                */
/* ------------------------------------------------------------------ */
app.get("/api/facilities", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM facilities WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows.map(mapFacilityRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/facilities error:", err.message);
    res.status(500).json({ message: "Failed to fetch facilities" });
  }
});

app.get("/api/admin/facilities", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM facilities ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows.map(mapFacilityRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/admin/facilities error:", err.message);
    res.status(500).json({ message: "Failed to fetch facilities" });
  }
});

app.post(
  "/api/admin/facilities",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const body = req.body || {};
      let payload = body;
      try {
        payload =
          typeof body.payload === "string" ? JSON.parse(body.payload) : body;
      } catch {
        payload = body;
      }

      const imageUrl = req.file ? `/uploads-byd/${req.file.filename}` : null;

      const [result] = await pool.query(
        `INSERT INTO facilities
          (\`key\`, label, description, image_url, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          payload.key || "",
          payload.label || "",
          payload.description || "",
          imageUrl,
          payload.isActive !== false,
          Number(payload.sortOrder) || 0
        ]
      );
      const [rows] = await pool.query(
        "SELECT * FROM facilities WHERE id = ?",
        [result.insertId]
      );
      res.status(201).json(mapFacilityRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("POST /api/admin/facilities error:", err.message);
      res.status(500).json({ message: "Failed to create facility" });
    }
  }
);

app.put(
  "/api/admin/facilities/:id",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = req.body || {};
      const [existingRows] = await pool.query(
        "SELECT * FROM facilities WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];
      let payload = body;
      try {
        payload =
          typeof body.payload === "string" ? JSON.parse(body.payload) : body;
      } catch {
        payload = body;
      }

      const fields = [];
      const params = [];

      if (payload.key !== undefined) {
        fields.push("`key` = ?");
        params.push(payload.key);
      }
      if (payload.label !== undefined) {
        fields.push("label = ?");
        params.push(payload.label);
      }
      if (payload.description !== undefined) {
        fields.push("description = ?");
        params.push(payload.description);
      }
      if (typeof payload.isActive !== "undefined") {
        fields.push("is_active = ?");
        params.push(payload.isActive);
      }
      if (payload.sortOrder !== undefined) {
        fields.push("sort_order = ?");
        params.push(Number(payload.sortOrder));
      }
      let newImageUrl = existing?.image_url || null;
      if (req.file) {
        newImageUrl = `/uploads-byd/${req.file.filename}`;
        fields.push("image_url = ?");
        params.push(newImageUrl);
      }

      if (!fields.length) {
        const [rows] = await pool.query(
          "SELECT * FROM facilities WHERE id = ?",
          [id]
        );
        if (!rows.length)
          return res.status(404).json({ message: "Facility not found" });
        return res.json(mapFacilityRow(rows[0]));
      }

      params.push(id);
      const sql = `UPDATE facilities SET ${fields.join(", ")} WHERE id = ?`;
      const [result] = await pool.query(sql, params);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Facility not found" });

      const [rows] = await pool.query(
        "SELECT * FROM facilities WHERE id = ?",
        [id]
      );
      if (existing?.image_url && existing.image_url !== newImageUrl) {
        await safeUnlink(existing.image_url);
      }
      res.json(mapFacilityRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PUT /api/admin/facilities/:id error:", err.message);
      res.status(500).json({ message: "Failed to update facility" });
    }
  }
);

app.delete(
  "/api/admin/facilities/:id",
  requireAuth,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await pool.query(
        "SELECT * FROM facilities WHERE id = ?",
        [id]
      );
      if (!rows.length)
        return res.status(404).json({ message: "Facility not found" });
      await pool.query("DELETE FROM facilities WHERE id = ?", [id]);
      await safeUnlink(rows[0].image_url);
      res.json(mapFacilityRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("DELETE /api/admin/facilities/:id error:", err.message);
      res.status(500).json({ message: "Failed to delete facility" });
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Testimonials (MySQL)                                              */
/* ------------------------------------------------------------------ */
app.get("/api/testimonials", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows.map(mapTestimonialRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/testimonials error:", err.message);
    res.status(500).json({ message: "Failed to fetch testimonials" });
  }
});

app.get("/api/testimonials/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM testimonials WHERE id = ?",
      [Number(req.params.id)]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json(mapTestimonialRow(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/testimonials/:id error:", err.message);
    res.status(500).json({ message: "Failed to fetch testimonial" });
  }
});

app.get("/api/admin/testimonials", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows.map(mapTestimonialRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/admin/testimonials error:", err.message);
    res.status(500).json({ message: "Failed to fetch testimonials" });
  }
});

app.post(
  "/api/admin/testimonials",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const body = req.body || {};
      let payload = body;
      try {
        payload =
          typeof body.payload === "string" ? JSON.parse(body.payload) : body;
      } catch {
        payload = body;
      }

      const imageUrl = req.file ? `/uploads-byd/${req.file.filename}` : payload.imageUrl || null;
      const [result] = await pool.query(
        `INSERT INTO testimonials
          (customer_name, city, title, message, rating, image_url, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.customerName || "",
          payload.city || "",
          payload.title || "",
          payload.message || "",
          payload.rating ?? null,
          imageUrl,
          payload.isActive !== false,
          Number(payload.sortOrder) || 0
        ]
      );
      const [rows] = await pool.query(
        "SELECT * FROM testimonials WHERE id = ?",
        [result.insertId]
      );
      res.status(201).json(mapTestimonialRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("POST /api/admin/testimonials error:", err.message);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  }
);

app.put(
  "/api/admin/testimonials/:id",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [existingRows] = await pool.query(
        "SELECT * FROM testimonials WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];
      const body = req.body || {};
      let payload = body;
      try {
        payload =
          typeof body.payload === "string" ? JSON.parse(body.payload) : body;
      } catch {
        payload = body;
      }
      const fields = [];
      const params = [];

      if (payload.customerName !== undefined) {
        fields.push("customer_name = ?");
        params.push(payload.customerName);
      }
      if (payload.city !== undefined) {
        fields.push("city = ?");
        params.push(payload.city);
      }
      if (payload.title !== undefined) {
        fields.push("title = ?");
        params.push(payload.title);
      }
      if (payload.message !== undefined) {
        fields.push("message = ?");
        params.push(payload.message);
      }
      if (payload.rating !== undefined) {
        fields.push("rating = ?");
        params.push(payload.rating);
      }
      if (payload.imageUrl !== undefined) {
        fields.push("image_url = ?");
        params.push(payload.imageUrl);
      }
      if (typeof payload.isActive !== "undefined") {
        fields.push("is_active = ?");
        params.push(payload.isActive);
      }
      if (payload.sortOrder !== undefined) {
        fields.push("sort_order = ?");
        params.push(Number(payload.sortOrder));
      }
      let newImageUrl = existing?.image_url || null;
      if (req.file) {
        newImageUrl = `/uploads-byd/${req.file.filename}`;
        fields.push("image_url = ?");
        params.push(newImageUrl);
      }

      if (!fields.length) {
        const [rows] = await pool.query(
          "SELECT * FROM testimonials WHERE id = ?",
          [id]
        );
        if (!rows.length) {
          return res.status(404).json({ message: "Testimonial not found" });
        }
        return res.json(mapTestimonialRow(rows[0]));
      }

      params.push(id);
      const sql = `UPDATE testimonials SET ${fields.join(", ")} WHERE id = ?`;
      const [result] = await pool.query(sql, params);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Testimonial not found" });
      }

      const [rows] = await pool.query(
        "SELECT * FROM testimonials WHERE id = ?",
        [id]
      );
      if (existing?.image_url && existing.image_url !== newImageUrl) {
        await safeUnlink(existing.image_url);
      }
      res.json(mapTestimonialRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PUT /api/admin/testimonials/:id error:", err.message);
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  }
);

app.delete(
  "/api/admin/testimonials/:id",
  requireAuth,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await pool.query(
        "SELECT * FROM testimonials WHERE id = ?",
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      await pool.query("DELETE FROM testimonials WHERE id = ?", [id]);
      await safeUnlink(rows[0].image_url);
      res.json(mapTestimonialRow(rows[0]));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("DELETE /api/admin/testimonials/:id error:", err.message);
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Routes — Uploads                                                   */
/* ------------------------------------------------------------------ */
app.post("/api/uploads", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.status(201).json({
    filename: req.file.filename,
    url: `/uploads-byd/${req.file.filename}`
  });
});

/* ------------------------------------------------------------------ */
/*  404 catch-all                                                      */
/* ------------------------------------------------------------------ */
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

async function bootstrap() {
  await testConnection();
  await loadSettingsFromDb();
  await ensureSeedTestimonials();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`BYD backend listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to bootstrap backend:", err.message);
  process.exit(1);
});
