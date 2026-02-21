from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Profile fields
    bio = Column(Text, nullable=True)
    hobbies = Column(JSON, nullable=True)  # ["Photography", "Hiking", "Food"]
    interests = Column(JSON, nullable=True)  # ["culture", "adventure", "food"]
    avatar_url = Column(String, nullable=True)
    
    # Relationships
    routes = relationship("SavedRoute", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("FavoritePlace", back_populates="user", cascade="all, delete-orphan")
    route_history = relationship("RouteHistory", back_populates="user", cascade="all, delete-orphan")


class SavedRoute(Base):
    __tablename__ = "saved_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    interests = Column(JSON, nullable=False)  # ["culture", "food"]
    places = Column(JSON, nullable=False)  # [{"name": "...", "lat": ..., "lng": ...}]
    mode = Column(String, default="walk")  # walk, driving, plane
    distance_km = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="routes")


class FavoritePlace(Base):
    __tablename__ = "favorite_places"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # culture, food, adventure, etc.
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="favorites")


class RouteHistory(Base):
    __tablename__ = "route_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    city = Column(String, nullable=False)
    interests = Column(JSON, nullable=False)
    stops = Column(Integer, nullable=False)
    mode = Column(String, default="walk")
    places = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="route_history")
