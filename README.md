## BYD Product Web

Fullstack web aplikasi katalog produk mobil BYD.

- **Frontend**: React + Vite (JSX), Tailwind CSS, Swiper, lucide-react, AOS
- **Backend**: Express.js (single `server.js`), folder upload `uploads-byd`
- **Database**: contoh migration SQL sederhana untuk tabel produk

### Struktur Folder

- `frontend/` – source code React
- `backend/` – source code Express
  - `uploads-byd/` – folder upload file
  - `migrations/` – file migration SQL & skrip runner

### Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

### Menjalankan Backend

```bash
cd backend
npm install
npm run migrate   # jalankan migration awal
npm run dev       # atau npm start
```

Setelah backend dan frontend berjalan, sesuaikan `API_BASE_URL` di `frontend/src/utils/api.js` jika port/backend berbeda.

# byd-tangerang
