import asyncio
from sqlalchemy import text
from database.database import AsyncSessionLocal

async def check_tables():
    async with AsyncSessionLocal() as session:
        # Check saved_routes
        result = await session.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='saved_routes' 
            ORDER BY ordinal_position
        """))
        print("saved_routes columns:")
        for row in result:
            print(f"  {row[0]}: {row[1]}")
        
        # Check route_history
        result2 = await session.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='route_history' 
            ORDER BY ordinal_position
        """))
        print("\nroute_history columns:")
        for row in result2:
            print(f"  {row[0]}: {row[1]}")

if __name__ == "__main__":
    asyncio.run(check_tables())
