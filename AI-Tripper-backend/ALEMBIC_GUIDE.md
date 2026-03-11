# 🚀 Alembic Database Migration Guide

## ✅ Kurulum Tamamlandı!

Projenizde artık profesyonel database migration sistemi kurulu ve çalışıyor.

---

## 📁 Yapı

```
AI-Tripper-backend/
├── alembic/
│   ├── versions/
│   │   └── 6556d8354d2d_initial_migration_with_unified_trip_.py
│   ├── env.py          # Alembic konfigürasyonu (asyncpg + .env)
│   ├── script.py.mako  # Migration template
│   └── README
├── alembic.ini         # Ana konfig dosyası
├── database/
│   ├── models.py       # SQLAlchemy modelleri
│   └── database.py     # DB connection
└── .env                # DATABASE_URL burada
```

---

## 🎯 Temel Komutlar

### 1️⃣ Mevcut Durumu Göster
```bash
cd AI-Tripper-backend
alembic current
```
**Çıktı:** `6556d8354d2d (head)` - Şu anki migration versiyonu

---

### 2️⃣ Migration Geçmişini Göster
```bash
alembic history --verbose
```

---

### 3️⃣ Yeni Migration Oluştur (Otomatik)
**Senaryo:** `User` modeline `phone_number` kolonu eklediniz.

```python
# database/models.py
class User(Base):
    # ... existing fields ...
    phone_number = Column(String, nullable=True)
```

**Komut:**
```bash
alembic revision --autogenerate -m "add phone_number to users"
```

**Sonuç:** `alembic/versions/` klasöründe yeni bir dosya oluşturulur:
```
a1b2c3d4e5f6_add_phone_number_to_users.py
```

---

### 4️⃣ Migration'ı Uygula
```bash
alembic upgrade head
```
**Ne Yapar:** Veritabanını en son versiyona getirir.

---

### 5️⃣ Migration Geri Al (Rollback)
**Son migration'ı geri al:**
```bash
alembic downgrade -1
```

**Belirli bir versiyona geri dön:**
```bash
alembic downgrade 6556d8354d2d
```

**Tüm migration'ları geri al:**
```bash
alembic downgrade base
```

---

## 🔥 Gerçek Hayat Senaryoları

### Scenario 1: Yeni Tablo Eklemek
```python
# database/models.py
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Komutlar:**
```bash
alembic revision --autogenerate -m "add notifications table"
alembic upgrade head
```

---

### Scenario 2: Kolon İsmi Değiştirmek
**Dikkat:** Alembic kolon ismini değiştirmeyi otomatik algılamaz!

```python
# Manuel migration dosyası düzenle
def upgrade():
    op.alter_column('users', 'full_name', new_column_name='display_name')

def downgrade():
    op.alter_column('users', 'display_name', new_column_name='full_name')
```

---

### Scenario 3: Data Migration (Veri Dönüşümü)
```python
# Migration dosyasında:
def upgrade():
    # Kolon ekle
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), default=False))
    
    # Mevcut kullanıcıları güncelle
    op.execute("UPDATE users SET email_verified = TRUE WHERE is_active = TRUE")

def downgrade():
    op.drop_column('users', 'email_verified')
```

---

## 🛡️ Best Practices

### ✅ DO (Yapın)
1. **Her önemli değişiklik için yeni migration oluşturun**
   ```bash
   alembic revision --autogenerate -m "descriptive message"
   ```

2. **Migration'ları git'e commit edin**
   ```bash
   git add alembic/versions/*.py
   git commit -m "feat: add user notifications table"
   ```

3. **Production'a deploy'dan önce test edin**
   ```bash
   # Test database'de
   alembic upgrade head
   ```

4. **Downgrade fonksiyonlarını test edin**
   ```bash
   alembic downgrade -1
   alembic upgrade head
   ```

---

### ❌ DON'T (Yapmayın)
1. **Eski migration dosyalarını silmeyin/değiştirmeyin**
   - Migration geçmişi bozulur
   
2. **Production'da otomatik migration çalıştırmayın**
   - Manuel kontrol edin ve onaylayın
   
3. **Migration olmadan model değiştirmeyin**
   - Database-model senkronizasyonu bozulur

---

## 🚨 Sorun Giderme

### Problem: "Target database is not up to date"
**Çözüm:**
```bash
alembic stamp head  # Mevcut database'i işaretle
alembic revision --autogenerate -m "sync database"
```

---

### Problem: "Can't locate revision identified by 'xyz'"
**Çözüm:**
```bash
# Database'deki version tablosunu kontrol et
# PostgreSQL:
psql -d aitripper -c "SELECT * FROM alembic_version;"

# Version'ı düzelt:
alembic stamp head
```

---

### Problem: Migration çakışması (merge conflict)
**Senaryo:** İki branch'te farklı migration'lar oluşturuldu.

**Çözüm:**
```bash
# İki migration'ı birleştir
alembic merge -m "merge migrations" abc123 def456
```

---

## 📊 Migration Durumunu Kontrol Et

### Database State
```bash
alembic current --verbose
```

### Uygulanacak Migration'lar
```bash
alembic upgrade head --sql  # SQL'i göster, uygulama
```

### Tüm Geçmiş
```bash
alembic history
```

---

## 🔐 Production Deployment

### 1. Development'ta Test Et
```bash
# Development database'de
alembic upgrade head
# Test et
alembic downgrade -1
alembic upgrade head
```

### 2. Staging'de Uygula
```bash
# Staging server'da
export DATABASE_URL="postgresql+asyncpg://user:pass@staging-db/aitripper"
alembic upgrade head
```

### 3. Production'a Deploy
```bash
# Production server'da
export DATABASE_URL="postgresql+asyncpg://user:pass@prod-db/aitripper"
alembic upgrade head
```

---

## 📝 Gelecekte Eklenecekler İçin Notlar

### Mevcut Şema
- ✅ `users` - User bilgileri (email, username, remaining_routes, vb.)
- ✅ `trips` - Birleşik tatil planları (is_saved ile saved/history ayrımı)
- ✅ `favorite_places` - Kullanıcı favorileri
- ✅ `subscriptions` - Premium abonelik sistemi
- ✅ `contact_messages` - İletişim formu mesajları

### Potansiyel Gelecek Değişiklikler
```python
# Örnek: Email verification
alembic revision --autogenerate -m "add email verification"

# Örnek: User preferences table
alembic revision --autogenerate -m "add user preferences table"

# Örnek: Trip sharing feature
alembic revision --autogenerate -m "add trip sharing features"
```

---

## 🎓 Öğrenme Kaynakları

- [Alembic Resmi Dokümantasyon](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Async Tutorial](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Alembic Migration Patterns](https://alembic.sqlalchemy.org/en/latest/cookbook.html)

---

## ✨ Özet

**Artık projenizde:**
- ✅ Profesyonel migration sistemi kurulu
- ✅ Asenkron database desteği (asyncpg)
- ✅ Otomatik migration generation
- ✅ Rollback desteği
- ✅ Version control entegrasyonu
- ✅ Production-ready altyapı

**Eski manuel migration scriptleri silindi:**
- ❌ `run_migration.py`
- ❌ `migrate_db.py`
- ❌ `migrate_tables.py`
- ❌ `*.sql` dosyaları

**Artık sadece Alembic kullanın! 🚀**
