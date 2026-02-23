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
    
    # Profile fields (opsiyonel, AI personalization için)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # AI için kullanıcı profil tercihleri (sabit, nadiren değişir)
    gender = Column(String, nullable=True)  # "erkek", "kadin", "diger", None
    age_range = Column(String, nullable=True)  # "18-25", "26-35", "36-45", "46+"
    travel_style = Column(String, nullable=True)  # "rahat", "aktif", "luks", "butce"
    
    # Relationships
    routes = relationship("SavedRoute", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("FavoritePlace", back_populates="user", cascade="all, delete-orphan")
    route_history = relationship("RouteHistory", back_populates="user", cascade="all, delete-orphan")


class SavedRoute(Base):
    """Kullanıcının beğendiği ve kaydettiği tatil planları"""
    __tablename__ = "saved_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)  # Kullanıcının verdiği isim: "Paris Gezim 2024"
    city = Column(String, nullable=False)
    country = Column(String, nullable=True)
    duration_days = Column(Integer, nullable=False)  # Kaç günlük plan
    travelers = Column(String, nullable=False)  # "yalniz", "cift", "aile", "arkadaslar"
    interests = Column(JSON, nullable=False)  # ["kultur", "yemek", "doga"]
    budget = Column(String, nullable=True)  # "dusuk", "orta", "yuksek"
    trip_plan = Column(JSON, nullable=False)  # Detaylı gün gün plan (AI'dan gelen)
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
    """Kullanıcının geçmiş arama ve planları (analitik için)"""
    __tablename__ = "route_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    city = Column(String, nullable=False)
    country = Column(String, nullable=True)
    duration_days = Column(Integer, nullable=False)  # Kaç gün
    travelers = Column(String, nullable=False)  # Kim ile: "yalniz", "cift", "aile", "arkadaslar"
    interests = Column(JSON, nullable=False)  # İlgi alanları
    budget = Column(String, nullable=True)  # "dusuk", "orta", "yuksek"
    transport = Column(String, nullable=True)  # "yuruyerek", "aracla", "toplu_tasima"
    trip_plan = Column(JSON, nullable=False)  # AI'dan dönen tüm plan (JSONse)
    mode = Column(String, default="walk")
    places = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="route_history")
