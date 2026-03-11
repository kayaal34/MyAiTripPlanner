# 🐘 pgAdmin 4 ile Database Bağlantısı

## 📋 Bağlantı Bilgileri

```
Host:     localhost
Port:     5432
Database: aitripper
Username: postgres
Password: trip1234
```

---

## 🔧 pgAdmin 4 Kurulum & Bağlantı Adımları

### 1️⃣ **pgAdmin 4'ü İndir ve Kur**

**İndirme Linki:** https://www.pgadmin.org/download/

- Windows için: `.exe` installer indir ve kur
- İlk açılışta master password belirle (bu pgAdmin'in kendi şifresi)

---

### 2️⃣ **Yeni Server Bağlantısı Ekle**

1. **pgAdmin 4'ü aç**
2. Sol panelde **Servers** üzerine sağ tık → **Register** → **Server**

---

### 3️⃣ **Bağlantı Ayarları**

#### **General Tab:**
```
Name: AI Trip Planner (Local)
```

#### **Connection Tab:**
```
Host name/address: localhost
Port: 5432
Maintenance database: aitripper
Username: postgres
Password: trip1234
☑️ Save password
```

#### **Save** butonuna tık!

---

### 4️⃣ **Database'i Görüntüle**

```
Servers
 └── AI Trip Planner (Local)
      └── Databases
           └── aitripper
                ├── Schemas
                │    └── public
                │         └── Tables
                │              ├── ✨ alembic_version (YENİ!)
                │              ├── contact_messages
                │              ├── favorite_places
                │              ├── subscriptions
                │              ├── trips
                │              └── users
                └── ...
```

---

## 🔍 Tabloları Görüntüleme

### **Yöntem 1: Query Tool (SQL)**

1. **aitripper** database üzerine sağ tık
2. **Query Tool** seç
3. SQL yaz ve çalıştır:

```sql
-- Tüm kullanıcıları listele
SELECT * FROM users;

-- Tüm trip planlarını listele
SELECT * FROM trips;

-- Alembic version kontrol
SELECT * FROM alembic_version;

-- Son 5 trip planını göster
SELECT 
    id, 
    city, 
    duration_days, 
    travelers, 
    is_saved, 
    created_at 
FROM trips 
ORDER BY created_at DESC 
LIMIT 5;
```

### **Yöntem 2: Görsel Arayüz**

1. Sol panelde: **Tables** genişlet
2. Tabloya sağ tık → **View/Edit Data** → **All Rows**
3. Grid view'da tüm veriler görünür

---

## 🎯 Alembic Version Kontrolü

```sql
-- Hangi migration uygulandı?
SELECT version_num FROM alembic_version;
-- Çıktı: 6556d8354d2d
```

Bu version numarası şu dosyadaki migration'a karşılık gelir:
```
AI-Tripper-backend/alembic/versions/6556d8354d2d_initial_migration_with_unified_trip_.py
```

---

## 📊 Faydalı SQL Sorgular

### **Kullanıcı İstatistikleri**
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    AVG(remaining_routes) as avg_remaining_routes
FROM users;
```

### **Trip İstatistikleri**
```sql
SELECT 
    city,
    COUNT(*) as trip_count,
    COUNT(*) FILTER (WHERE is_saved = true) as saved_count
FROM trips
GROUP BY city
ORDER BY trip_count DESC
LIMIT 10;
```

### **Subscription Durumu**
```sql
SELECT 
    plan,
    COUNT(*) as user_count
FROM subscriptions
GROUP BY plan;
```

### **Son Oluşturulan Trip'ler**
```sql
SELECT 
    t.id,
    u.username,
    t.city,
    t.duration_days,
    t.travelers,
    t.created_at
FROM trips t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;
```

---

## 🛠️ Database Bakımı

### **Backup Alma**
1. **aitripper** database'e sağ tık
2. **Backup...**
3. Filename belirle (örn: `aitripper_backup_2026-03-11.backup`)
4. Format: **Custom**
5. **Backup** tıkla

### **Restore Etme**
1. **aitripper** database'e sağ tık
2. **Restore...**
3. Backup dosyasını seç
4. **Restore** tıkla

---

## ⚠️ DİKKAT!

### **Production Database'e ASLA Bağlanma!**
- Bu bilgiler sadece **local development** için
- Production database farklı credentials kullanmalı
- Production'da mutlaka SSL/TLS kullan

### **Migration Uygulamadan Önce Backup Al!**
```bash
# Alembic ile migration yapmadan önce
pg_dump -U postgres aitripper > backup_before_migration.sql
```

---

## 🚀 Hızlı Bağlantı Testi (Terminal)

```bash
# PostgreSQL bağlantı testi
psql -h localhost -U postgres -d aitripper

# Bağlandıktan sonra:
\dt              # Tabloları listele
\d users         # users tablosu yapısını göster
SELECT * FROM alembic_version;
\q               # Çıkış
```

---

## 🔗 Yararlı Linkler

- **pgAdmin Dökümantasyonu:** https://www.pgadmin.org/docs/
- **PostgreSQL Dökümantasyonu:** https://www.postgresql.org/docs/
- **Alembic Dökümantasyonu:** https://alembic.sqlalchemy.org/

---

**NOT:** Database şifresi (trip1234) `.env` dosyasında saklanıyor:
```env
DATABASE_URL=postgresql+asyncpg://postgres:trip1234@localhost:5432/aitripper
```
