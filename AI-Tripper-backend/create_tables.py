"""
Sync database table creator
Run: python create_tables.py
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

# Use sync psycopg2 driver
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/aitripper")

# Create sync engine
engine = create_engine(DATABASE_URL, echo=True)

# Import all models to register them with Base
from database.models import User, Trip, FavoritePlace, ContactMessage, Subscription

print("\n🔧 Creating database tables...")

try:
    # Import Base from models (already has all model definitions)
    from database.models import Base
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("\n✅ All tables created successfully!")
    print("\nCreated tables:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
