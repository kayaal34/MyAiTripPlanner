from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
from database.database import get_db
from auth.security import get_current_active_user

router = APIRouter(prefix="/api/routes", tags=["routes"])


@router.post("/saved", response_model=schemas.SavedRoute)
def create_saved_route(
    route: schemas.SavedRouteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_route = models.SavedRoute(**route.dict(), user_id=current_user.id)
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route


@router.get("/saved", response_model=List[schemas.SavedRoute])
def get_saved_routes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    routes = db.query(models.SavedRoute).filter(
        models.SavedRoute.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return routes


@router.get("/saved/{route_id}", response_model=schemas.SavedRoute)
def get_saved_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    route = db.query(models.SavedRoute).filter(
        models.SavedRoute.id == route_id,
        models.SavedRoute.user_id == current_user.id
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.put("/saved/{route_id}", response_model=schemas.SavedRoute)
def update_saved_route(
    route_id: int,
    route_update: schemas.SavedRouteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_route = db.query(models.SavedRoute).filter(
        models.SavedRoute.id == route_id,
        models.SavedRoute.user_id == current_user.id
    ).first()
    if not db_route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    for key, value in route_update.dict().items():
        setattr(db_route, key, value)
    
    db.commit()
    db.refresh(db_route)
    return db_route


@router.delete("/saved/{route_id}")
def delete_saved_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_route = db.query(models.SavedRoute).filter(
        models.SavedRoute.id == route_id,
        models.SavedRoute.user_id == current_user.id
    ).first()
    if not db_route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    db.delete(db_route)
    db.commit()
    return {"message": "Route deleted successfully"}
