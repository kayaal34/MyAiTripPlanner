# 📬 Contact Mesaj Yönetimi

## 🚀 Hızlı Başlangıç

```bash
cd AI-Tripper-backend
python manage_messages.py
```

---

## ⚡ Hızlı Komutlar

### Ana Menüde:
```
[s] → İstatistikler
[u] → Okunmamış mesajları göster
[l] → Tüm mesajları göster
[r] → Mesaj oku (ID gir)
[m] → Okundu işaretle (ID gir)
[a] → Tümünü okundu işaretle
[d] → Mesaj sil (ID gir)
[q] → Çıkış
```

---

## 📋 Kullanım Örnekleri

### Senaryo 1: Günlük Kontrol
```bash
python manage_messages.py
> u          # Okunmamış mesajları gör
> r          # Bir mesaj oku
> 5          # ID: 5
> m          # Okundu işaretle
> 5          # ID: 5
> q          # Çık
```

### Senaryo 2: Hızlı İstatistik
```bash
python manage_messages.py
> s          # İstatistikleri gör
> q          # Çık
```

### Senaryo 3: Toplu Okundu İşaretle
```bash
python manage_messages.py
> a          # Tümünü okundu işaretle
> e          # Evet, eminim
> q          # Çık
```

---

## 🎨 Renk Kodları

- 📧 **Sarı**: Okunmamış mesaj
- ✅ **Yeşil**: Okunmuş mesaj
- 🔵 **Mavi**: Bilgi
- 🔴 **Kırmızı**: Hata
- ⚠️ **Sarı**: Uyarı

---

## ⌨️ Kısayollar

| Komut | Tam Ad | Alternatif |
|-------|--------|------------|
| s | stats | 1 |
| l | list | 2 |
| u | unread | 3 |
| r | read | 4 |
| m | mark | 5 |
| a | all | 6 |
| d | delete | 7 |
| q | quit | 0, exit |

---

## 💡 İpuçları

1. **Hızlı Kontrol:** Sadece `u` yaz, okunmamışları gör
2. **ID Numarası:** Mesajların yanında [...] içinde
3. **Çıkış:** `q` veya `Ctrl+C`
4. **Renkler Görünmüyor?** Windows Terminal kullan

---

## 🔧 Sorun Giderme

### Database'e bağlanamıyor?
```bash
# .env dosyasını kontrol et
cd AI-Tripper-backend
cat .env | grep DATABASE_URL
```

### Renkler görünmüyor?
```bash
# Windows Terminal veya PowerShell 7+ kullan
```

---

## 📞 Yardım

Sorun mu var? Terminal'de:
```bash
python manage_messages.py
```
sonra `q` ile çık ve çalışma şeklini gör.
