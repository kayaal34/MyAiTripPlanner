"""
Drop old tables and use new unified Trip model
"""
import asyncio
from sqlalchemy import text
from database.database import AsyncSessionLocal

async def drop_old_tables():
    async with AsyncSessionLocal() as session:
        try:
            print("🗑️  Eski tablolar siliniyor...")
            
            # Drop old tables
            await session.execute(text("DROP TABLE IF EXISTS saved_routes CASCADE"))
            await session.execute(text("DROP TABLE IF EXISTS route_history CASCADE"))
            await session.commit()
            
            print("✅ Eski tablolar silindi")
            print("✅ Yeni 'trips' tablosu kullanıma hazır!")
            
        except Exception as e:
            print(f"❌ Hata: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(drop_old_tables())
