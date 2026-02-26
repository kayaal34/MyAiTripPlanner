from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from database.database import get_db
from database.models import ContactMessage as ContactMessageModel
from database.schemas import ContactMessageCreate, ContactMessage
from typing import List
from auth.security import get_current_user
from database.models import User

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("/", response_model=ContactMessage, status_code=201)
async def create_contact_message(
    message_data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """İletişim formu mesajı gönder (herkes kullanabilir, login gerekmez)"""
    
    # Yeni mesaj oluştur
    new_message = ContactMessageModel(
        name=message_data.name,
        email=message_data.email,
        subject=message_data.subject,
        message=message_data.message,
        is_read=False
    )
    
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    
    return new_message


@router.get("/messages", response_model=List[ContactMessage])
async def get_all_messages(
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Sadece login kullanıcılar görebilir
):
    """
    Tüm mesajları listele
    
    NOT: Şu an herhangi bir login kullanıcı görebilir.
    Production'da admin yetkisi kontrolü eklenebilir.
    """
    
    query = select(ContactMessageModel)
    
    if unread_only:
        query = query.where(ContactMessageModel.is_read == False)
    
    query = query.order_by(ContactMessageModel.created_at.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    return messages


@router.patch("/messages/{message_id}/read", response_model=ContactMessage)
async def mark_message_as_read(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mesajı okundu olarak işaretle"""
    
    # Mesajı bul
    result = await db.execute(
        select(ContactMessageModel).where(ContactMessageModel.id == message_id)
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Okundu işaretle
    message.is_read = True
    await db.commit()
    await db.refresh(message)
    
    return message


@router.get("/messages/stats")
async def get_message_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mesaj istatistikleri (toplam, okunmamış)"""
    
    # Toplam mesaj sayısı
    total_result = await db.execute(select(ContactMessageModel))
    total_count = len(total_result.scalars().all())
    
    # Okunmamış mesaj sayısı
    unread_result = await db.execute(
        select(ContactMessageModel).where(ContactMessageModel.is_read == False)
    )
    unread_count = len(unread_result.scalars().all())
    
    return {
        "total_messages": total_count,
        "unread_messages": unread_count,
        "read_messages": total_count - unread_count
    }
