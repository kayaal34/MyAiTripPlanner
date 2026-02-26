import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import redis

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Database URL - asyncpg sürücüsü ile
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/aitripper"
)

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

# Redis client (optional - senkron kalıyor, istenirse redis.asyncio kullanılabilir)
try:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()  # Test connection
except Exception as e:
    print(f"Redis connection failed: {e}. Continuing without cache.")
    redis_client = None

# Async Dependency
async def get_db():
    """Asenkron database session dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
