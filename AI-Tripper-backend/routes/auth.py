from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from database import models, schemas
from database.database import get_db
from auth.security import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_user_by_username,
    get_user_by_email,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    db_user = await get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    db_user = await get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.User)
async def read_users_me(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=schemas.User)
async def update_user_profile(
    user_update: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Update user fields
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.hobbies is not None:
        current_user.hobbies = user_update.hobbies
    if user_update.interests is not None:
        current_user.interests = user_update.interests
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    
    # Update new personal preference fields
    if user_update.gender is not None:
        current_user.gender = user_update.gender
    if user_update.preferred_countries is not None:
        current_user.preferred_countries = user_update.preferred_countries
    if user_update.vacation_types is not None:
        current_user.vacation_types = user_update.vacation_types
    if user_update.travel_style is not None:
        current_user.travel_style = user_update.travel_style
    if user_update.age_range is not None:
        current_user.age_range = user_update.age_range
    
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Delete user and all related data (cascade)
    await db.delete(current_user)
    await db.commit()
    return None
