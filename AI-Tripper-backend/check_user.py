import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def check_users():
    engine = create_async_engine('postgresql+asyncpg://postgres:trip123@localhost:5433/aitripper')
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get all users
        result = await session.execute(text("SELECT id, email, remaining_routes FROM users"))
        users = result.fetchall()
        
        print('\n👤 KULLANICILAR:')
        print('=' * 60)
        for user in users:
            routes_display = "∞ SINIRSIZ" if user[2] == -1 else f"{user[2]} rota"
            print(f'  ID: {user[0]:2d} | Email: {user[1]:30s} | Routes: {routes_display}')
        print('=' * 60)

asyncio.run(check_users())
