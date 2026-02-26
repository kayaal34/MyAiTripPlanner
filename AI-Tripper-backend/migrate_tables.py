"""
Database migration script - User ve History tablolarını günceller
Eski kolonları siler, yeni kolonları ekler
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/aitripper")
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print("🔄 Migration başlıyor...")
        
        try:
            # User tablosundan gereksiz kolonları sil
            print("1️⃣ User tablosundan eski kolonlar siliniyor...")
            conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS hobbies CASCADE"))
            conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS interests CASCADE"))
            conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS preferred_countries CASCADE"))
            conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS vacation_types CASCADE"))
            conn.commit()
            print("✅ User tablosu temizlendi")
            
            # SavedRoute tablosunu güncelle
            print("2️⃣ SavedRoute tablosu güncelleniyor...")
            conn.execute(text("ALTER TABLE saved_routes DROP COLUMN IF EXISTS places CASCADE"))
            conn.execute(text("ALTER TABLE saved_routes DROP COLUMN IF EXISTS mode CASCADE"))
            conn.execute(text("ALTER TABLE saved_routes DROP COLUMN IF EXISTS distance_km CASCADE"))
            conn.execute(text("ALTER TABLE saved_routes DROP COLUMN IF EXISTS duration_minutes CASCADE"))
            
            # Yeni kolonlar ekle
            conn.execute(text("ALTER TABLE saved_routes ADD COLUMN IF NOT EXISTS country VARCHAR"))
            conn.execute(text("ALTER TABLE saved_routes ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 3"))
            conn.execute(text("ALTER TABLE saved_routes ADD COLUMN IF NOT EXISTS travelers VARCHAR NOT NULL DEFAULT 'yalniz'"))
            conn.execute(text("ALTER TABLE saved_routes ADD COLUMN IF NOT EXISTS budget VARCHAR"))
            conn.execute(text("ALTER TABLE saved_routes ADD COLUMN IF NOT EXISTS trip_plan JSONB NOT NULL DEFAULT '{}'::jsonb"))
            conn.commit()
            print("✅ SavedRoute tablosu güncellendi")
            
            # RouteHistory tablosunu güncelle
            print("3️⃣ RouteHistory tablosu güncelleniyor...")
            conn.execute(text("ALTER TABLE route_history DROP COLUMN IF EXISTS stops CASCADE"))
            conn.execute(text("ALTER TABLE route_history DROP COLUMN IF EXISTS mode CASCADE"))
            conn.execute(text("ALTER TABLE route_history DROP COLUMN IF EXISTS places CASCADE"))
            
            # Yeni kolonlar ekle
            conn.execute(text("ALTER TABLE route_history ADD COLUMN IF NOT EXISTS country VARCHAR"))
            conn.execute(text("ALTER TABLE route_history ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 3"))
            conn.execute(text("ALTER TABLE route_history ADD COLUMN IF NOT EXISTS travelers VARCHAR NOT NULL DEFAULT 'yalniz'"))
            conn.execute(text("ALTER TABLE route_history ADD COLUMN IF NOT EXISTS budget VARCHAR"))
            conn.execute(text("ALTER TABLE route_history ADD COLUMN IF NOT EXISTS transport VARCHAR"))
            conn.execute(text("ALTER TABLE route_history ADD COLUMN IF NOT EXISTS trip_plan JSONB NOT NULL DEFAULT '{}'::jsonb"))
            conn.commit()
            print("✅ RouteHistory tablosu güncellendi")
            
            print("🎉 Migration tamamlandı!")
            
        except Exception as e:
            print(f"❌ Migration hatası: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    migrate()
