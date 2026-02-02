# 🧺 Kucucikan Laundry Web System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License](https://img.shields.io/badge/License-UNLICENSED-yellow.svg)
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

**Solusi Manajemen Laundry Modern Berbasis Web**

_Dibangun dengan Next.js 16 & NestJS 11 untuk meningkatkan efisiensi operasional, transparansi keuangan, dan keterlibatan pelanggan._

[Demo](#demo) • [Instalasi](#-instalasi) • [Deployment](#-deployment) • [Dokumentasi](#-dokumentasi-api)

</div>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

![Next JS](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React%2019-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS%204-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

### Backend

![NestJS](https://img.shields.io/badge/NestJS%2011-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma%207-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

### Tools & Libraries

![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge&logo=recharts&logoColor=white)

</div>

---

## 🚀 Fitur Utama

Sistem ini mencakup **7 modul utama** yang telah terintegrasi penuh:

### 1. 🛡️ Modul Keamanan & Akses

| Fitur                 | Deskripsi                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Login PIN 6 Digit** | Autentikasi cepat dan aman ala ATM tanpa password rumit                                  |
| **Role Management**   | Pemisahan tegas antara dashboard **Owner** (Manajemen) dan **Admin/Kasir** (Operasional) |
| **Void Protection**   | Penghapusan order atau aksi sensitif memerlukan otorisasi PIN Owner                      |
| **Force Logout**      | Fitur Force Logout oleh Owner untuk mengamankan shift                                    |

### 2. 🖥️ Modul Kasir (POS)

| Fitur                        | Deskripsi                                                  |
| ---------------------------- | ---------------------------------------------------------- |
| **Visual Service Selection** | Pemilihan layanan dengan ikon emoji yang intuitif          |
| **Smart Calculation**        | Mendukung berbagai satuan (Kiloan, Satuan/PCS, Per-Load)   |
| **Customer Search**          | Pencarian cepat pelanggan via 4 digit terakhir nomor HP    |
| **Payment Methods**          | Mendukung pembayaran Tunai, QRIS, Debit, dan Transfer Bank |
| **Digital Receipt**          | Invoice otomatis tersimpan dengan status LUNAS/BELUM LUNAS |

### 3. ⚙️ Modul Operasional

| Fitur                 | Deskripsi                                                |
| --------------------- | -------------------------------------------------------- |
| **Live Machine Grid** | Monitoring status mesin real-time dengan indikator warna |
| **Machine Status**    | 🟢 IDLE • 🟡 WASHING • 🔴 OVERDUE • ⚫ BROKEN            |
| **Flexible Timer**    | Durasi cuci yang dapat disesuaikan saat start order      |
| **Rack Location**     | Input lokasi rak penyimpanan setelah cucian selesai      |

### 4. 💰 Modul Keuangan (Shift & Cash Management)

| Fitur                 | Deskripsi                                                                         |
| --------------------- | --------------------------------------------------------------------------------- |
| **Blind Closing**     | Kasir menutup shift dengan input uang fisik tanpa melihat ekspektasi sistem       |
| **Shift Handover**    | Cetak ringkasan shift fisik untuk serah terima antar kasir (via `react-to-print`) |
| **Expense Tracking**  | Catat pengeluaran operasional (sabun, makan, bensin) dengan kategori ikon         |
| **Revenue Breakdown** | Laporan terpisah untuk pendapatan Tunai vs Digital (QRIS/Transfer/Debit)          |

### 5. 📈 Modul Marketing (CRM)

| Fitur                      | Deskripsi                                                                |
| -------------------------- | ------------------------------------------------------------------------ |
| **Pelanggan "Sultan"**     | Leaderboard pelanggan berdasarkan total belanja dan frekuensi kunjungan  |
| **Customer History**       | Riwayat transaksi lengkap per pelanggan                                  |
| **Passive Customer Alert** | Filter pelanggan pasif (>30 hari) untuk follow-up                        |
| **WA Blast Integration**   | Kirim pesan promo via WhatsApp Web dengan satu klik                      |
| **Promo System**           | Manajemen kode diskon (Nominal/Persen) yang bisa diapply saat pembayaran |

### 6. 📦 Modul Inventory

| Fitur                | Deskripsi                                         |
| -------------------- | ------------------------------------------------- |
| **Stock Management** | CRUD data barang (Deterjen, Parfum, Plastik, dll) |
| **Smart Restock**    | Input pembelian stok masuk                        |
| **Usage Tracking**   | Pencatatan pemakaian stok harian                  |
| **Low Stock Alert**  | Indikator stok menipis                            |
| **Service Recipe**   | Resep pemakaian bahan per layanan                 |

### 7. 📊 Laporan & Dashboard

| Fitur                | Deskripsi                                                        |
| -------------------- | ---------------------------------------------------------------- |
| **Owner Dashboard**  | Tampilan dark-theme premium dengan statistik real-time           |
| **Financial Charts** | Grafik tren pendapatan dan popularitas layanan                   |
| **Cash Audit**       | Laporan selisih (discrepancy) antara sistem vs riil uang di laci |
| **Export Data**      | Download laporan transaksi ke format CSV                         |

---

## 📋 Prasyarat

Pastikan Anda telah menginstal:

| Software              | Versi Minimum |
| --------------------- | ------------- |
| **Node.js**           | v18.0.0+      |
| **npm** / yarn / pnpm | terbaru       |
| **PostgreSQL**        | v14.0+        |

---

## 💻 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/kucucikan-laundry.git
cd kucucikan-laundry/apps
```

### 2. Setup Backend (`apps/api`)

```bash
# Masuk ke direktori api
cd api

# Install dependencies
npm install
```

**Konfigurasi Environment:**

Buat file `.env` di root folder `api` dan isi dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kucucikan_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
```

**Sinkronisasi Database:**

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database (development)
npx prisma db push

# Atau gunakan migration (production)
npx prisma migrate dev --name init

# (Opsional) Seed data awal
npm run prisma:seed
```

**Jalankan Server:**

```bash
# Development mode (Hot Reload)
npm run start:dev

# Server berjalan di http://localhost:4000
```

### 3. Setup Frontend (`apps/web`)

Buka terminal baru:

```bash
# Masuk ke direktori web
cd apps/web

# Install dependencies
npm install
```

**Konfigurasi Environment:**

Buat file `.env.local` di root folder `web`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Jalankan Aplikasi:**

```bash
# Development mode
npm run dev

# Aplikasi berjalan di http://localhost:3000
```

---

## 🚀 Deployment

### Opsi 1: Deploy ke Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel)

1. **Push ke GitHub**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import di Vercel**
   - Buka [vercel.com](https://vercel.com) dan login
   - Klik **"New Project"** → Import repository GitHub Anda
   - Set **Root Directory** ke `apps/web`
   - Tambahkan Environment Variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```
   - Klik **Deploy**

#### Backend (Railway)

1. **Buka [railway.app](https://railway.app) dan login**

2. **Create New Project** → **Deploy from GitHub repo**

3. **Konfigurasi Service:**
   - Set **Root Directory** ke `apps/api`
   - Set **Build Command**: `npm run build`
   - Set **Start Command**: `npm run start:prod`

4. **Tambahkan PostgreSQL**
   - Klik **"Add"** → **PostgreSQL**
   - Railway akan otomatis menyediakan `DATABASE_URL`

5. **Environment Variables:**

   ```
   DATABASE_URL=<auto-generated-by-railway>
   JWT_SECRET=your-production-secret
   JWT_EXPIRES_IN=7d
   PORT=4000
   ```

6. **Jalankan Migration:**
   - Buka Railway shell atau jalankan via settings:
   ```bash
   npx prisma migrate deploy
   ```

---

### Opsi 2: Deploy dengan Docker

#### Docker Compose (Full Stack)

Buat file `docker-compose.yml` di root project:

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: kucucikan
      POSTGRES_PASSWORD: secret_password
      POSTGRES_DB: kucucikan_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql://kucucikan:secret_password@db:5432/kucucikan_db
      JWT_SECRET: your-jwt-secret
      PORT: 4000
    ports:
      - "4000:4000"
    depends_on:
      - db

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: http://api:4000
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

**Build & Run:**

```bash
docker-compose up -d --build
```

---

### Opsi 3: Deploy ke VPS (Manual)

#### 1. Setup Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (Process Manager)
npm install -g pm2
```

#### 2. Setup Database

```bash
sudo -u postgres psql

CREATE USER kucucikan WITH PASSWORD 'your_password';
CREATE DATABASE kucucikan_db OWNER kucucikan;
GRANT ALL PRIVILEGES ON DATABASE kucucikan_db TO kucucikan;
\q
```

#### 3. Deploy Backend

```bash
cd /var/www/kucucikan/apps/api
npm install
npm run build
npx prisma migrate deploy

# Jalankan dengan PM2
pm2 start dist/main.js --name "kucucikan-api"
pm2 save
pm2 startup
```

#### 4. Deploy Frontend

```bash
cd /var/www/kucucikan/apps/web
npm install
npm run build

# Jalankan dengan PM2
pm2 start npm --name "kucucikan-web" -- start
pm2 save
```

#### 5. Setup Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/kucucikan

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kucucikan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📂 Struktur Project

```
kucucikan-laundry/
├── apps/
│   ├── api/                    # 🔧 Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/           # Autentikasi (JWT, PIN Guard)
│   │   │   ├── customers/      # Manajemen Pelanggan
│   │   │   ├── expenses/       # Pencatatan Pengeluaran
│   │   │   ├── inventory/      # Manajemen Stok
│   │   │   ├── machines/       # Monitoring Mesin
│   │   │   ├── orders/         # Logika Transaksi
│   │   │   ├── promos/         # Sistem Promo
│   │   │   ├── reports/        # Laporan & Analytics
│   │   │   ├── services/       # Layanan Laundry
│   │   │   ├── shifts/         # Manajemen Shift
│   │   │   ├── store-settings/ # Pengaturan Toko
│   │   │   └── users/          # Manajemen User
│   │   └── prisma/             # Schema Database
│   │
│   └── web/                    # 🎨 Frontend Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/  # Halaman Admin/Kasir
│       │   │   │   ├── pos/         # Point of Sale
│       │   │   │   ├── orders/      # Manajemen Order
│       │   │   │   ├── machines/    # Monitor Mesin
│       │   │   │   ├── customers/   # Data Pelanggan
│       │   │   │   ├── inventory/   # Stok Barang
│       │   │   │   ├── services/    # Layanan
│       │   │   │   ├── shift/       # Shift Kasir
│       │   │   │   └── operations/  # Operasional
│       │   │   └── owner/      # Halaman Owner
│       │   │       ├── finance/     # Keuangan
│       │   │       ├── reports/     # Laporan
│       │   │       ├── promos/      # Manajemen Promo
│       │   │       ├── users/       # Manajemen User
│       │   │       └── settings/    # Pengaturan
│       │   ├── components/     # Reusable UI Components
│       │   ├── lib/            # Utilities & API Client
│       │   └── types/          # TypeScript Definitions
```

---

## 📚 Dokumentasi API

Backend menyediakan dokumentasi Swagger yang dapat diakses di:

```
http://localhost:4000/api
```

---

## 🔐 Default Credentials

Setelah menjalankan seed, gunakan kredensial berikut untuk login:

| Role  | Username | PIN      |
| ----- | -------- | -------- |
| Owner | `owner`  | `123456` |
| Admin | `admin`  | `123456` |

> ⚠️ **Penting:** Ubah PIN default setelah deployment ke production!

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat Pull Request atau Issue.

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📝 License

Project ini menggunakan lisensi **UNLICENSED** (Private).

---

<div align="center">

Dibuat dengan ❤️ oleh **Tim Developer Kucucikan**

![Made with Love](https://img.shields.io/badge/Made%20with-Love-ff69b4?style=for-the-badge)

</div>
