import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import redis.asyncio as redis

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Database URL - postgresql:// ise asyncpg'ye çevir
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/aitripper"
)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # SQL loglarını görmek için True yapabilirsin
    future=True,
    pool_pre_ping=True,  # Bağlantı kontrolü
)

# Create AsyncSessionLocal class
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create Base class
Base = declarative_base()

# Redis client (async)
redis_client = None

async def init_redis():
    """Redis bağlantısını başlat (async)"""
    global redis_client
    try:
        REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        await redis_client.ping()
        print("✅ Redis connected successfully")
    except Exception as e:
        print(f"⚠️ Redis connection failed: {e}. Continuing without cache.")
        redis_client = None

async def close_redis():
    """Redis bağlantısını kapat (async)"""
    global redis_client
    if redis_client:
        await redis_client.close()
        print("✅ Redis connection closed")

# Async Dependency
async def get_db():
    """Asenkron database session dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
