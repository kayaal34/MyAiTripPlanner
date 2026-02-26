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
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("FavoritePlace", back_populates="user", cascade="all, delete-orphan")


class Trip(Base):
    """
    Birleştirilmiş tatil planları tablosu (eski SavedRoute + RouteHistory)
    - is_saved=False: Kullanıcının arama geçmişi (history)
    - is_saved=True: Kullanıcının kaydettiği planlar (saved)
    """
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Kayıt durumu
    is_saved = Column(Boolean, default=False, index=True)  # Kaydedildi mi?
    name = Column(String, nullable=True)  # Kullanıcının verdiği isim (sadece is_saved=True için)
    
    # Tatil bilgileri
    city = Column(String, nullable=False, index=True)
    country = Column(String, nullable=True)
    duration_days = Column(Integer, nullable=False)  # Kaç günlük plan
    
    # Seyahat tercihleri
    travelers = Column(String, nullable=False)  # "yalniz", "cift", "aile", "arkadaslar"
    interests = Column(JSON, nullable=False)  # ["kultur", "yemek", "doga"]
    budget = Column(String, nullable=True)  # "dusuk", "orta", "yuksek"
    transport = Column(String, nullable=True)  # "ucak", "araba", "farketmez"
    mode = Column(String, default="walk")  # Eski sistemden kalan (deprecated)
    
    # AI plan verisi
    trip_plan = Column(JSON, nullable=False)  # Detaylı gün gün plan (AI'dan gelen)
    places = Column(JSON, nullable=True)  # Eski sistemden gelen yerler (deprecated)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="trips")


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


class ContactMessage(Base):
    """İletişim formu mesajları"""
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)  # Okundu mu?
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
