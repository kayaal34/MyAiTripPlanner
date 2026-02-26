from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import models, schemas
from database.database import get_db
from auth.security import get_current_active_user

router = APIRouter(prefix="/api/history", tags=["history"])


@router.post("/", response_model=schemas.Trip)
async def create_history(
    history: schemas.TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a trip history entry (is_saved=False)"""
    trip_data = history.dict()
    trip_data['user_id'] = current_user.id
    trip_data['is_saved'] = False  # History entries are not saved
    
    db_trip = models.Trip(**trip_data)
    db.add(db_trip)
    await db.commit()
    await db.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[schemas.Trip])
async def get_history(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all trip history (both saved and unsaved)"""
    result = await db.execute(
        select(models.Trip)
        .filter(models.Trip.user_id == current_user.id)
        .order_by(models.Trip.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    history = result.scalars().all()
    return history
