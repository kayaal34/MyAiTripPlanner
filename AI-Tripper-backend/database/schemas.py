from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    hobbies: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    
    # Personal preferences for AI trip planning
    gender: Optional[str] = None
    preferred_countries: Optional[List[str]] = None
    vacation_types: Optional[List[str]] = None
    travel_style: Optional[str] = None
    age_range: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    bio: Optional[str] = None
    hobbies: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    
    # Personal preferences for AI trip planning
    gender: Optional[str] = None
    preferred_countries: Optional[List[str]] = None
    vacation_types: Optional[List[str]] = None
    travel_style: Optional[str] = None
    age_range: Optional[str] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# Place Schemas
class PlaceBase(BaseModel):
    name: str
    lat: float
    lng: float
    address: Optional[str] = None
    description: Optional[str] = None

class FavoritePlaceCreate(PlaceBase):
    category: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class FavoritePlace(FavoritePlaceCreate):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Trip Schemas (Unified SavedRoute + RouteHistory)
class TripCreate(BaseModel):
    """Create a new trip (either saved or just history)"""
    city: str
    country: Optional[str] = None
    duration_days: int
    travelers: str  # "yalniz", "cift", "aile", "arkadaslar"
    interests: List[str]
    budget: Optional[str] = None
    transport: Optional[str] = None
    mode: str = "walk"  # deprecated
    trip_plan: dict
    places: Optional[List[dict]] = None  # deprecated
    is_saved: bool = False
    name: Optional[str] = None  # Only for saved trips

class TripUpdate(BaseModel):
    """Update trip (mainly for marking as saved or renaming)"""
    is_saved: Optional[bool] = None
    name: Optional[str] = None

class Trip(BaseModel):
    """Trip model response"""
    id: int
    user_id: int
    is_saved: bool
    name: Optional[str] = None
    city: str
    country: Optional[str] = None
    duration_days: int
    travelers: str
    interests: List[str]
    budget: Optional[str] = None
    transport: Optional[str] = None
    mode: str
    trip_plan: dict
    places: Optional[List[dict]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Backwards compatibility (deprecated schemas)
class SavedRouteCreate(TripCreate):
    """Deprecated: Use TripCreate with is_saved=True"""
    pass

class SavedRoute(Trip):
    """Deprecated: Use Trip"""
    pass

class RouteHistoryCreate(TripCreate):
    """Deprecated: Use TripCreate with is_saved=False"""
    stops: Optional[int] = None  # deprecated field

class RouteHistory(Trip):
    """Deprecated: Use Trip"""
    pass


# ============= Contact Schemas =============

class ContactMessageCreate(BaseModel):
    """İletişim formu mesajı oluşturma"""
    name: str
    email: str
    subject: Optional[str] = None
    message: str

class ContactMessage(BaseModel):
    """İletişim formu mesajı response"""
    id: int
    name: str
    email: str
    subject: Optional[str] = None
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
