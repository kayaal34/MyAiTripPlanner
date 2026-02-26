"""
Migration script: Merge SavedRoute and RouteHistory into unified Trip model

Bu script:
1. Eski saved_routes tablosunu trips tablosuna taşır (is_saved=True)
2. Eski route_history tablosunu trips tablosuna taşır (is_saved=False)
3. Eski tabloları siler (opsiyonel)
"""

import asyncio
from sqlalchemy import text
from database.database import engine, AsyncSessionLocal
from database import models


async def migrate_data():
    """Migrate old SavedRoute and RouteHistory data to new Trip table"""
    
    async with AsyncSessionLocal() as session:
        try:
            print("🔄 Migration başlatılıyor...")
            
            # Check if old tables exist
            result = await session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('saved_routes', 'route_history')
            """))
            existing_tables = [row[0] for row in result.fetchall()]
            
            if not existing_tables:
                print("✅ Eski tablolar bulunamadı, migration'a gerek yok")
                return
            
            print(f"📋 Bulunan eski tablolar: {existing_tables}")
            
            # Migrate saved_routes -> trips (is_saved=True)
            if 'saved_routes' in existing_tables:
                result = await session.execute(text("""
                    INSERT INTO trips (
                        user_id, is_saved, name, city, country, duration_days,
                        travelers, interests, budget, transport, mode, trip_plan,
                        places, created_at, updated_at
                    )
                    SELECT 
                        user_id, 
                        TRUE as is_saved,
                        name,
                        city,
                        country,
                        duration_days,
                        travelers,
                        interests,
                        budget,
                        NULL as transport,
                        'walk' as mode,
                        trip_plan,
                        NULL as places,
                        created_at,
                        updated_at
                    FROM saved_routes
                    ON CONFLICT DO NOTHING
                """))
                await session.commit()
                migrated_saved = result.rowcount
                print(f"✅ {migrated_saved} adet SavedRoute → Trip (is_saved=True) migrate edildi")
            
            # Migrate route_history -> trips (is_saved=False)
            if 'route_history' in existing_tables:
                result = await session.execute(text("""
                    INSERT INTO trips (
                        user_id, is_saved, name, city, country, duration_days,
                        travelers, interests, budget, transport, mode, trip_plan,
                        places, created_at, updated_at
                    )
                    SELECT 
                        user_id,
                        FALSE as is_saved,
                        NULL as name,
                        city,
                        country,
                        COALESCE(duration_days, 1) as duration_days,
                        COALESCE(travelers, 'yalniz') as travelers,
                        interests,
                        budget,
                        transport,
                        COALESCE(mode, 'walk') as mode,
                        COALESCE(trip_plan, '{}') as trip_plan,
                        places,
                        created_at,
                        created_at as updated_at
                    FROM route_history
                    ON CONFLICT DO NOTHING
                """))
                await session.commit()
                migrated_history = result.rowcount
                print(f"✅ {migrated_history} adet RouteHistory → Trip (is_saved=False) migrate edildi")
            
            print("\n🎉 Migration başarıyla tamamlandı!")
            
            # Ask user if they want to drop old tables
            print("\n⚠️  Eski tablolar (saved_routes, route_history) hala duruyor.")
            print("   Manuel olarak silmek için:")
            print("   DROP TABLE saved_routes CASCADE;")
            print("   DROP TABLE route_history CASCADE;")
            
        except Exception as e:
            print(f"❌ Migration hatası: {e}")
            await session.rollback()
            raise


async def create_trips_table():
    """Create trips table if it doesn't exist"""
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    print("✅ trips tablosu oluşturuldu/kontrol edildi")


async def main():
    print("=" * 60)
    print("   SavedRoute + RouteHistory → Trip Migration Script")
    print("=" * 60)
    
    # Create trips table
    await create_trips_table()
    
    # Migrate data
    await migrate_data()
    
    print("\n✅ Tüm işlemler tamamlandı!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
