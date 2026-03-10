import asyncio
import asyncpg

async def run_migration():
    # Connect to database
    conn = await asyncpg.connect('postgresql://postgres:trip1234@localhost:5432/aitripper')
    
    try:
        # Add column if not exists
        await conn.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS remaining_routes INTEGER DEFAULT 3 NOT NULL;
        """)
        
        # Set existing users to 3 free routes
        await conn.execute("""
            UPDATE users SET remaining_routes = 3 WHERE remaining_routes IS NULL;
        """)
        
        print("✅ Migration completed successfully!")
        print("✅ remaining_routes column added to users table")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
