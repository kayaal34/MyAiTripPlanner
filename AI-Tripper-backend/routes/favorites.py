from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import models, schemas
from database.database import get_db
from auth.security import get_current_active_user

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.post("/", response_model=schemas.FavoritePlace)
async def create_favorite(
    favorite: schemas.FavoritePlaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_favorite = models.FavoritePlace(**favorite.dict(), user_id=current_user.id)
    db.add(db_favorite)
    await db.commit()
    await db.refresh(db_favorite)
    return db_favorite


@router.get("/", response_model=List[schemas.FavoritePlace])
async def get_favorites(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(models.FavoritePlace)
        .filter(models.FavoritePlace.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    favorites = result.scalars().all()
    return favorites


@router.delete("/{favorite_id}")
async def delete_favorite(
    favorite_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(models.FavoritePlace).filter(
            models.FavoritePlace.id == favorite_id,
            models.FavoritePlace.user_id == current_user.id
        )
    )
    db_favorite = result.scalar_one_or_none()
    if not db_favorite:
        raise HTTPException(status_code=404, detail="Favorite place not found")
    
    await db.delete(db_favorite)
    await db.commit()
    return {"message": "Favorite place deleted successfully"}
