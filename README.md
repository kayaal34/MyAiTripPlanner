# AI Trip Planner

AI Trip Planner, kullanicinin sehir, ilgi alanlari, butce ve seyahat tipi bilgilerine gore AI destekli gezi plani olusturan full-stack bir uygulamadir.

Proje iki ana parcadan olusur:

- AI-Tripper-backend: FastAPI + PostgreSQL + SQLAlchemy (async) + JWT
- AI-Tripper-front: React + TypeScript + Vite + Tailwind CSS

## Ozellikler

- Kimlik dogrulama: Kayit, giris, profil guncelleme
- AI rota olusturma: Sehir/ilgi alanina gore rota onerisi
- Detayli tatil plani: Gun gun itinerary olusturma
- Kayitli planlar: Planlari kaydetme, listeleme, guncelleme, silme
- Favori mekanlar: Favori yer ekleme/silme
- Gecmis: Olusturulan planlarin gecmisi
- Iletisim mesaji: Iletisim formu ve mesaj yonetimi
- Abonelik altyapisi: Stripe tabanli plan endpointleri

## Teknolojiler

- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand, React Query
- Backend: FastAPI, Uvicorn, SQLAlchemy Async, Alembic, Pydantic
- Veritabani: PostgreSQL
- Cache (opsiyonel): Redis
- AI: Gemini API (GOOGLE_API_KEY)

## Proje Yapisi

```text
MyAiTripPlanner/
  AI-Tripper-backend/
  AI-Tripper-front/
  README.md
```

## Gereksinimler

- Node.js 18+
- npm 9+
- Python 3.10+
- PostgreSQL 14+
- (Opsiyonel) Redis

## Kurulum

### 1) Repoyu klonla

```bash
git clone https://github.com/kayaal34/MyAiTripPlanner.git
cd MyAiTripPlanner
```

### 2) Backend kurulumu

```bash
cd AI-Tripper-backend
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Bagimliliklari yukle:

```bash
pip install -r requirements.txt
```

### 3) Veritabani hazirligi

PostgreSQL icinde bir veritabani olustur:

```sql
CREATE DATABASE aitripper;
```

### 4) Backend ortam degiskenleri

AI-Tripper-backend klasorunde .env dosyasi olustur:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/aitripper
SECRET_KEY=your_long_random_secret_key
GOOGLE_API_KEY=your_gemini_api_key

# Opsiyonel
REDIS_URL=redis://localhost:6379/0
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PREMIUM_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
```

### 5) Migration calistir

AI-Tripper-backend klasorunde:

```bash
alembic upgrade head
```

### 6) Frontend kurulumu

Proje kok dizininden:

```bash
npm --prefix AI-Tripper-front install
```

Istersen AI-Tripper-front klasorunde .env olustur:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Calistirma

Iki ayri terminal ac.

Terminal 1 (Backend):

```bash
cd AI-Tripper-backend
.venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend - proje kokunden):

```bash
npm --prefix AI-Tripper-front run dev
```

Uygulama adresleri:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

## Siklikla Kullanilan Komutlar

```bash
# Frontend
npm --prefix AI-Tripper-front run dev
npm --prefix AI-Tripper-front run build
npm --prefix AI-Tripper-front run lint

# Backend
cd AI-Tripper-backend
uvicorn main:app --reload
alembic upgrade head
```

## Temel API Endpointleri

- GET / -> API health bilgisi
- POST /api/auth/register -> Kayit
- POST /api/auth/login -> Giris
- GET /api/auth/me -> Profil getir
- PUT /api/auth/me -> Profil guncelle
- POST /api/route -> Basit rota olustur
- POST /api/trip-planner -> Gun gun detayli plan olustur
- GET /api/routes/saved -> Kayitli planlar
- GET /api/history -> Gecmis planlar
- GET /api/subscription/plans -> Abonelik planlari

## Notlar

- CORS su an gelistirme icin acik olarak ayarli.
- Stripe, Redis ve Unsplash alanlari opsiyoneldir; ilgili ozellikleri kullanacaksan doldur.
- Gizli bilgileri (API key, sifre) repoya commit etmeyin.

## Lisans

Bu proje su an icin ozel/depo bazli kullanima yoneliktir. Ihtiyaca gore lisans dosyasi eklenebilir.