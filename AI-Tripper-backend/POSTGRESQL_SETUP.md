# PostgreSQL Bağlantı Bilgileri

## Kurulum Sonrası

1. PostgreSQL kurduktan sonra bu komutu çalıştır:

```bash
# PostgreSQL bin klasörünü PATH'e ekle (PowerShell Admin):
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path, "Machine")
```

2. Veritabanı oluştur:

```bash
# PowerShell'de çalıştır:
cd "C:\Program Files\PostgreSQL\16\bin"
.\createdb.exe -U postgres aitripper
```

Şifre sorarsa kurulum sırasında belirlediğin şifreyi gir.

## .env Dosyası

```env
DATABASE_URL=postgresql://postgres:ŞIFREN@localhost:5432/aitripper
```

`ŞIFREN` yerine PostgreSQL kurulumunda belirlediğin şifreyi yaz.

## Test

```bash
psql -U postgres -d aitripper
# Bağlandıysa başarılı! \q ile çık
```
