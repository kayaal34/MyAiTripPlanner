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
    
    # Subscription & Usage Limits
    remaining_routes = Column(Integer, default=3, nullable=False)  # Free users: 3, Premium/Pro: -1 (unlimited)
    
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
    # Deprecated: kept only for backward compatibility with older records.
    mode = Column(String, nullable=True, default=None)
    
    # AI plan verisi
    # Canonical trip payload used by the new planner flow.
    trip_plan = Column(JSON, nullable=False)
    # Deprecated: kept only for backward compatibility with older records.
    places = Column(JSON, nullable=True)
    
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


class Subscription(Base):
    """Premium abonelik sistemi"""
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Stripe bilgileri
    stripe_customer_id = Column(String, nullable=True, index=True)
    stripe_subscription_id = Column(String, nullable=True, index=True)
    
    # Plan bilgileri
    plan = Column(String, nullable=False, default="free")  # "free", "premium", "pro"
    status = Column(String, nullable=False, default="active")  # "active", "canceled", "past_due"
    
    # Fiyatlandırma
    amount = Column(Float, default=0.0)  # Aylık ücret
    currency = Column(String, default="usd")
    
    # Tarihler
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="subscription")


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
