# 🔐 Stripe CLI Kurulum Rehberi

Bu belge, projeyi localhost'ta çalıştırmak isteyen geliştiriciler için Stripe CLI kurulum adımlarını içerir.

## 📋 Ön Gereksinimler

- Python 3.9+ yüklü olmalı
- Node.js 18+ yüklü olmalı
- PostgreSQL veritabanı çalışıyor olmalı
- Stripe hesabı olmalı (test mode)

## 📦 1. Stripe CLI Kurulumu

### Windows İçin:

```powershell
# 1. Stripe CLI'yı indir
# https://github.com/stripe/stripe-cli/releases/latest
# stripe_X.X.X_windows_x86_64.zip dosyasını indir

# 2. İstediğin klasöre çıkart (örn: C:\stripe-cli\)

# 3. PATH'e ekle (PowerShell Admin):
$env:Path += ";C:\stripe-cli\"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::User)

# 4. Yükleme kontrolü
stripe --version
```

### macOS/Linux İçin:

```bash
# Homebrew ile
brew install stripe/stripe-cli/stripe

# Ya da direkt indirme
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

## 🔑 2. Stripe Hesabına Bağlan

```powershell
# Terminal'de çalıştır
stripe login

# Tarayıcı açılacak → "Allow access" butonuna tıkla
# Terminal'de "Done! Your CLI is configured." mesajını göreceksin
```

## 🔗 3. Webhook Secret Oluştur

```powershell
# Webhook listener'ı başlat (webhook secret otomatik oluşacak)
stripe listen --forward-to http://localhost:8000/api/subscription/webhook

# ÇOK ÖNEMLİ: Terminal'de görünen webhook secret'i kopyala
# Örnek: whsec_abc123def456...
```

**Output örneği:**
```
> Ready! Your webhook signing secret is whsec_c39f0234...
> Listening to Stripe webhooks on http://localhost:8000/api/subscription/webhook
```

## ⚙️ 4. Backend .env Ayarları

`AI-Tripper-backend/.env` dosyasını düzenle:

```env
# Stripe API Keys (Test mode)
STRIPE_SECRET_KEY=sk_test_51T6oV4...  # Stripe Dashboard'dan al
STRIPE_PUBLISHABLE_KEY=pk_test_51T6oV4...  # Stripe Dashboard'dan al

# Webhook Secret (Stripe CLI'dan aldığın)
STRIPE_WEBHOOK_SECRET=whsec_c39f0234...  # 3. adımda aldığın secret

# Diğer ayarlar...
DATABASE_URL=postgresql://postgres:trip123@localhost:5433/aitripper
JWT_SECRET=your-secret-key-here
```

## 🚀 5. Projeyi Başlat

### Terminal 1 - Backend:
```powershell
cd C:\aitripper\MyAiTripPlanner\AI-Tripper-backend
& ..\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

### Terminal 2 - Frontend:
```powershell
cd C:\aitripper\MyAiTripPlanner\AI-Tripper-front
npm run dev
```

### Terminal 3 - Stripe CLI:
```powershell
cd C:\stripe-cli
.\stripe.exe listen --forward-to http://localhost:8000/api/subscription/webhook
```

**ÖNEMLİ:** Bu terminal'i **açık bırak!** Kapatırsan webhook'lar çalışmaz.

## 🧪 6. Test Et

1. Tarayıcıda: http://localhost:5173
2. Giriş yap veya kayıt ol
3. **Pricing** sayfasına git
4. Bir plana tıkla (Premium veya Pro)
5. Stripe test kartı kullan:
   - Kart: `4242 4242 4242 4242`
   - Tarih: Gelecekte herhangi bir tarih
   - CVC: Herhangi 3 rakam

6. Ödemeyi tamamla
7. 8 saniye bekle (otomatik yönlendirme)
8. Navbar'da **"∞ Sınırsız"** göreceksin ✅

## 📊 Webhook Loglarını İzle

Stripe CLI terminal'inde webhook eventlerini göreceksin:

```
→ POST /api/subscription/webhook [200]
  evt_test_webhook_123
  customer.subscription.created
```

Backend terminal'inde:

```
🎯 Webhook alındı: customer.subscription.created
✅ Kullanıcı bilgileri güncellendi - User ID: 12, Remaining routes: -1
🎉 Subscription oluşturuldu! User ID: 12, Plan: premium
```

## ❓ Sorun Giderme

### Webhook'lar Çalışmıyor?

```powershell
# Stripe CLI çalışıyor mu?
Get-Process stripe

# Çalışmıyorsa başlat
cd C:\stripe-cli
.\stripe.exe listen --forward-to http://localhost:8000/api/subscription/webhook
```

### Backend'e Bağlanamıyor?

```powershell
# Backend port 8000'de mi?
netstat -ano | findstr :8000

# Test et
Invoke-WebRequest http://localhost:8000/docs
```

### Ödeme Sonrası Routes Güncellenmiyor?

1. **F12** → Console'da hata var mı?
2. Stripe CLI terminal'inde webhook gelmiş mi?
3. Backend'de `remaining_routes = -1` logu var mı?
4. Manuel refresh butonuna tıkla (navbar'daki ↻ icon)

### LocalStorage Temizle

```javascript
// Browser Console'da (F12 → Console):
localStorage.removeItem('auth-storage')
// Sayfayı yenile ve tekrar giriş yap
```

## 🌐 Production'da Ne Değişir?

Production'da **Stripe CLI'ya gerek yok!** 

Çünkü:
- Gerçek domain var (örn: https://myaitripplanner.com)
- Stripe direkt o URL'e webhook gönderir
- Stripe Dashboard → Webhooks → "Add endpoint"
- URL: `https://myaitripplanner.com/api/subscription/webhook`
- Events: `customer.subscription.created`, `checkout.session.completed`

## 📝 Notlar

- Stripe CLI **sadece development** için gerekli
- Her geliştirici kendi webhook secret'ini oluşturmalı (paylaşılmamalı)
- Test kartları: https://stripe.com/docs/testing
- Production'da gerçek Stripe keys kullan (.env'de)

## 🔗 Faydalı Linkler

- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/webhooks)
- [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
