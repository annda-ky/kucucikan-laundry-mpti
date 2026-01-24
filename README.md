# 🧺 Kucucikan Laundry Web System

Selamat datang di **Kucucikan Laundry Web System**, solusi manajemen laundry modern berbasis web yang dibangun dengan **Next.js** dan **NestJS**. Sistem ini dirancang untuk meningkatkan efisiensi operasional, transparansi keuangan, dan keterlibatan pelanggan.

## 🚀 Fitur Utama

Sistem ini mencakup 7 modul utama yang telah terintegrasi penuh:

### 1. 🛡️ Modul Keamanan & Akses

- **Login PIN 6 Digit**: Autentikasi cepat dan aman ala ATM tanpa password rumit.
- **Role Management**: Pemisahan tegas antara dashboard **Owner** (Manajemen) dan **Admin/Kasir** (Operasional).
- **Void Protection**: Penghapusan order atau aksi sensitif memerlukan otorisasi PIN Owner.
- **Double Logout**: Fitur Force Logout oleh Owner untuk mengamankan shift.

### 2. 🖥️ Modul Kasir (POS)

- **Visual Service Selection**: Pemilihan layanan dengan ikon emoji yang intuitif.
- **Smart Calculation**: Mendukung berbagai satuan (Kiloan, Satuan/PCS, Per-Load).
- **Customer Search**: Pencarian cepat pelanggan via 4 digit terakhir nomor HP.
- **Payment Methods**: Mendukung pembayaran Tunai, QRIS, dan Transfer Bank.
- **Digital Receipt**: Invoice otomatis tersimpan dengan status LUNAS/BELUM LUNAS yang jelas.

### 3. ⚙️ Modul Operasional

- **Live Machine Grid**: Monitoring status mesin real-time dengan indikator warna:
  - 🟢 **IDLE**: Siap digunakan
  - 🟡 **WASHING**: Sedang mencuci
  - 🔴 **OVERDUE**: Selesai/Lewat waktu (Visual Alarm)
- **Flexible Timer**: Durasi cuci yang dapat disesuaikan saat start order.
- **Rack Location**: Input lokasi rak penyimpanan setelah cucian selesai.

### 4. 💰 Modul Keuangan (Shift & Cash Management)

- **Blind Closing**: Kasir menutup shift dengan input uang fisik tanpa melihat ekspektasi sistem (Mencegah fraud).
- **Shift Handover**: **Fitur Baru!** Cetak ringkasan shift fisik untuk serah terima antar kasir (via `react-to-print`).
- **Expense Tracking**: Catat pengeluaran operasional (sabun, makan, bensin) dengan kategori ikon.
- **Revenue Breakdown**: Laporan terpisah untuk pendapatan Tunai vs Digital (QRIS/Transfer).

### 5. 📈 Modul Marketing (CRM)

- **Pelanggan "Sultan"**: Leaderboard pelanggan berdasarkan total belanja dan frekuensi kunjungan.
- **Customer History**: Riwayat transaksi lengkap per pelanggan.
- **Passive Customer Alert**: Filter pelanggan pasif (>30 hari) untuk follow-up.
- **WA Blast Integration**: Kirim pesan promo via WhatsApp Web dengan satu klik.
- **Promo System**: Manajemen kode diskon (Nominal/Persen) yang bisa diapply saat pembayaran.

### 6. 📦 Modul Inventory

- **Stock Management**: CRUD data barang (Deterjen, Parfum, Plastik, dll).
- **Smart Restock**: Input pembelian stok masuk.
- **Usage Tracking**: Pencatatan pemakaian stok harian.
- **Low Stock Alert**: Indikator stok menipis.

### 7. 📊 Laporan & Dashboard

- **Owner Dashboard**: Tampilan dark-theme premium dengan statistik real-time.
- **Financial Charts**: Grafik tren pendapatan dan popularitas layanan.
- **Cash Audit**: Laporan selisih (discrepancy) antara sistem vs riil uang di laci.
- **Export Data**: Download laporan transaksi ke format CSV.

---

## 🛠️ Tech Stack

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

### Frontend (`apps/web`)

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Components**: Lucide Icons, Headless UI
- **State/Fetch**: Axios, SWR approach
- **Charts**: Recharts
- **Printing**: `react-to-print`

### Backend (`apps/api`)

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT & Custom PIN Guard

---

## 💻 Cara Menjalankan Project

### Prasyarat

- Node.js (v18 ke atas)
- PostgreSQL Database
- NPM / Yarn / PNPM

### 1. Setup Backend (`apps/api`)

Masuk ke direktori api dan instal dependensi:

```bash
cd apps/api
npm install
```

Buat file `.env` dan sesuaikan `DATABASE_URL` ke PostgreSQL Anda.

Sinkronisasi database:

```bash
npx prisma generate
npx prisma db push
```

Jalankan server backend:

```bash
npm run start:dev
# Server berjalan di http://localhost:3001
```

### 2. Setup Frontend (`apps/web`)

Buka terminal baru, masuk ke direktori web dan instal dependensi:

```bash
cd apps/web
npm install
```

Pastikan konfigurasi API URL mengarah ke backend (biasanya di `src/lib/api-client.ts` atau `.env.local` jika ada).

Jalankan server frontend:

```bash
npm run dev
# Aplikasi berjalan di http://localhost:3000
```

---

## 📂 Struktur Project

```
kucucikan-laundry/
├── apps/
│   ├── api/                # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/       # Autentikasi
│   │   │   ├── orders/     # Logika Transaksi
│   │   │   ├── ...         # Modul lainnya
│   │   └── prisma/         # Schema Database
│   │
│   └── web/                # Frontend Next.js
│       ├── src/
│       │   ├── app/        # App Router Pages
│       │   │   ├── dashboard/ # Halaman Admin/Kasir
│       │   │   ├── owner/     # Halaman Owner
│       │   ├── components/ # Reusable UI Components
│       │   ├── services/   # API Integration
│       │   └── types/      # TypeScript Definitions
```

---

Dibuat dengan ❤️ oleh Tim Developer Kucucikan.
