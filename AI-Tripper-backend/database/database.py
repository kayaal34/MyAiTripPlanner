import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import redis

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/aitripper"
)

# Create engine with appropriate settings
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Redis client (optional)
try:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()  # Test connection
except Exception as e:
    print(f"Redis connection failed: {e}. Continuing without cache.")
    redis_client = None

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
