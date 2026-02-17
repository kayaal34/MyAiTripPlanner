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

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
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


# Route Schemas
class SavedRouteCreate(BaseModel):
    name: str
    city: str
    interests: List[str]
    places: List[dict]
    mode: str = "walk"
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None

class SavedRoute(SavedRouteCreate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Route History Schemas
class RouteHistoryCreate(BaseModel):
    city: str
    interests: List[str]
    stops: int
    mode: str = "walk"
    places: List[dict]

class RouteHistory(RouteHistoryCreate):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
