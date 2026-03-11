"""
Alembic durumunu kontrol et ve göster
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

async def check_alembic():
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:trip1234@localhost:5432/aitripper")
    # Remove +asyncpg if present
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("\n🔍 ALEMBIC DURUM KONTROLÜ\n")
        print("=" * 60)
        
        # 1. Alembic version table var mı?
        alembic_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'alembic_version'
            )
        """)
        
        if alembic_exists:
            print("✅ alembic_version tablosu mevcut (Alembic aktif)")
            
            # 2. Mevcut version nedir?
            current_version = await conn.fetchval("SELECT version_num FROM alembic_version")
            print(f"📌 Mevcut migration version: {current_version}")
            
        else:
            print("❌ alembic_version tablosu YOK (Manuel migration kullanılıyor)")
        
        print("\n" + "=" * 60)
        print("📊 DATABASE TABLOLARI:\n")
        
        # 3. Tüm tabloları listele
        tables = await conn.fetch("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        """)
        
        for idx, table in enumerate(tables, 1):
            if table['tablename'] == 'alembic_version':
                print(f"{idx}. ✨ {table['tablename']} (YENİ - Alembic tracking)")
            else:
                print(f"{idx}. {table['tablename']}")
        
        print("\n" + "=" * 60)
        print("🎯 FARK:\n")
        print("Eski sistem: Manuel migration scriptleri (run_migration.py)")
        print("  ❌ Hangi migration'ın yapıldığı belirsiz")
        print("  ❌ Rollback yok")
        print("  ❌ Version control zor")
        print("\nYeni sistem: Alembic")
        print("  ✅ alembic_version tablosu ile tracking")
        print("  ✅ alembic upgrade/downgrade komutları")
        print("  ✅ Git'te migration dosyaları (alembic/versions/)")
        print("  ✅ Autogenerate (models.py değişikliklerini otomatik algıla)")
        print("=" * 60)
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_alembic())
