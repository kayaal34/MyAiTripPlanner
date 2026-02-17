from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
from database.database import get_db
from auth.security import get_current_active_user

router = APIRouter(prefix="/api/history", tags=["history"])


@router.post("/", response_model=schemas.RouteHistory)
def create_history(
    history: schemas.RouteHistoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_history = models.RouteHistory(**history.dict(), user_id=current_user.id)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history


@router.get("/", response_model=List[schemas.RouteHistory])
def get_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    history = db.query(models.RouteHistory).filter(
        models.RouteHistory.user_id == current_user.id
    ).order_by(models.RouteHistory.created_at.desc()).offset(skip).limit(limit).all()
    return history
