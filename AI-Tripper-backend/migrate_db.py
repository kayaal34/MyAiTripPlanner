from sqlalchemy import text
from database.database import engine

print("🔧 Database migration başlatılıyor...")

with engine.connect() as conn:
    try:
        # Yeni kolonları ekle
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR'))
        print("✅ gender kolonu eklendi")
        
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_countries JSON'))
        print("✅ preferred_countries kolonu eklendi")
        
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS vacation_types JSON'))
        print("✅ vacation_types kolonu eklendi")
        
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS travel_style VARCHAR'))
        print("✅ travel_style kolonu eklendi")
        
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS age_range VARCHAR'))
        print("✅ age_range kolonu eklendi")
        
        conn.commit()
        print("\n🎉 Tüm migration işlemleri başarıyla tamamlandı!")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        conn.rollback()
