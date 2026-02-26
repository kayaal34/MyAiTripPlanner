from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import models, schemas
from database.database import get_db
from auth.security import get_current_active_user

router = APIRouter(prefix="/api/routes", tags=["routes"])


@router.post("/saved", response_model=schemas.Trip)
async def create_saved_route(
    route: schemas.TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Save a trip to user's saved trips"""
    trip_data = route.dict()
    trip_data['user_id'] = current_user.id
    trip_data['is_saved'] = True  # Mark as saved
    
    db_trip = models.Trip(**trip_data)
    db.add(db_trip)
    await db.commit()
    await db.refresh(db_trip)
    return db_trip


@router.get("/saved", response_model=List[schemas.Trip])
async def get_saved_routes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all saved trips (is_saved=True)"""
    result = await db.execute(
        select(models.Trip)
        .filter(
            models.Trip.user_id == current_user.id,
            models.Trip.is_saved == True
        )
        .offset(skip)
        .limit(limit)
    )
    routes = result.scalars().all()
    return routes


@router.get("/saved/{trip_id}", response_model=schemas.Trip)
async def get_saved_route(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get a specific saved trip"""
    result = await db.execute(
        select(models.Trip).filter(
            models.Trip.id == trip_id,
            models.Trip.user_id == current_user.id,
            models.Trip.is_saved == True
        )
    )
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Saved trip not found")
    return route


@router.put("/saved/{trip_id}", response_model=schemas.Trip)
async def update_saved_route(
    trip_id: int,
    route_update: schemas.TripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update a saved trip (rename or mark as unsaved)"""
    result = await db.execute(
        select(models.Trip).filter(
            models.Trip.id == trip_id,
            models.Trip.user_id == current_user.id
        )
    )
    db_trip = result.scalar_one_or_none()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    for key, value in route_update.dict(exclude_unset=True).items():
        setattr(db_trip, key, value)
    
    await db.commit()
    await db.refresh(db_trip)
    return db_trip


@router.delete("/saved/{trip_id}")
async def delete_saved_route(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete a saved trip (or just mark as unsaved)"""
    result = await db.execute(
        select(models.Trip).filter(
            models.Trip.id == trip_id,
            models.Trip.user_id == current_user.id,
            models.Trip.is_saved == True
        )
    )
    db_trip = result.scalar_one_or_none()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Saved trip not found")
    
    await db.delete(db_trip)
    await db.commit()
    return {"message": "Saved trip deleted successfully"}
