from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
from database.database import get_db
from auth.security import get_current_active_user

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.post("/", response_model=schemas.FavoritePlace)
def create_favorite(
    favorite: schemas.FavoritePlaceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_favorite = models.FavoritePlace(**favorite.dict(), user_id=current_user.id)
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite


@router.get("/", response_model=List[schemas.FavoritePlace])
def get_favorites(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    favorites = db.query(models.FavoritePlace).filter(
        models.FavoritePlace.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return favorites


@router.delete("/{favorite_id}")
def delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_favorite = db.query(models.FavoritePlace).filter(
        models.FavoritePlace.id == favorite_id,
        models.FavoritePlace.user_id == current_user.id
    ).first()
    if not db_favorite:
        raise HTTPException(status_code=404, detail="Favorite place not found")
    
    db.delete(db_favorite)
    db.commit()
    return {"message": "Favorite place deleted successfully"}
