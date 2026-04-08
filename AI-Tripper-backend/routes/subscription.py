from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import stripe
import os
from datetime import datetime

from database.database import get_db
from database.models import Subscription, User
from auth.security import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/subscription", tags=["subscription"])

# Stripe secrets are read lazily to avoid stale values after .env edits.


def _get_stripe_secret_key() -> str:
    key = (os.getenv("STRIPE_SECRET_KEY") or "").strip()
    if not key or key.endswith("_YOUR_SECRET_KEY_HERE"):
        raise HTTPException(
            status_code=500,
            detail="Stripe is not configured. Set STRIPE_SECRET_KEY in AI-Tripper-backend/.env and restart backend.",
        )
    return key


def _get_webhook_secret() -> str:
    secret = (os.getenv("STRIPE_WEBHOOK_SECRET") or "").strip()
    if not secret or secret.endswith("_YOUR_WEBHOOK_SECRET_HERE"):
        raise HTTPException(
            status_code=500,
            detail="Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET in AI-Tripper-backend/.env and restart backend.",
        )
    return secret


# Pydantic Schemas
class PlanInfo(BaseModel):
    name: str
    price: float
    features: list[str]
    stripe_price_id: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan: str
    status: str
    amount: float
    currency: str
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    
    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    plan: str  # "premium" or "pro"
    success_url: str
    cancel_url: str


# Plan tanımları (Stripe'da oluşturulacak)
PLANS = {
    "free": PlanInfo(
        name="Free",
        price=0,
        features=[
            "3 rota planı/ay",
            "Temel AI önerileri",
            "Harita görünümü"
        ]
    ),
    "premium": PlanInfo(
        name="Premium",
        price=9.99,
        features=[
            "Sınırsız rota planı",
            "Gelişmiş AI önerileri",
            "Detaylı gün gün program",
            "Favori yerler kaydetme",
            "Öncelikli destek"
        ],
        stripe_price_id=os.getenv("STRIPE_PREMIUM_PRICE_ID")
    ),
    "pro": PlanInfo(
        name="Pro",
        price=19.99,
        features=[
            "Premium'daki tüm özellikler",
            "Özel AI asistanı",
            "Offline haritalar",
            "Grup planlaması",
            "VIP destek",
            "Erken erişim özellikleri"
        ],
        stripe_price_id=os.getenv("STRIPE_PRO_PRICE_ID")
    )
}


@router.get("/plans")
def get_plans():
    """Tüm plan seçeneklerini getir"""
    return {
        "plans": [
            {
                "id": plan_id,
                "name": plan.name,
                "price": plan.price,
                "features": plan.features
            }
            for plan_id, plan in PLANS.items()
        ]
    }


@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının mevcut aboneliğini getir"""
    result = await db.execute(
        select(Subscription).filter(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    
    # Abonelik yoksa, Free plan oluştur
    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan="free",
            status="active",
            amount=0.0,
            currency="usd"
        )
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)
    
    return subscription


@router.post("/checkout")
async def create_checkout_session(
    checkout_request: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stripe Checkout Session oluştur"""
    plan = checkout_request.plan.lower()
    
    if plan not in ["premium", "pro"]:
        raise HTTPException(status_code=400, detail="Geçersiz plan")
    
    plan_info = PLANS[plan]
    stripe.api_key = _get_stripe_secret_key()
    
    try:
        # Gerçek Stripe Checkout Session oluştur
        print(f"🎯 Stripe Checkout Session oluşturuluyor...")
        print(f"   User: {current_user.email} (ID: {current_user.id})")
        print(f"   Plan: {plan.upper()} - ${plan_info.price}/ay")
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": int(plan_info.price * 100),  # Cent cinsinden
                        "product_data": {
                            "name": f"{plan_info.name} Plan",
                            "description": f"AI Trip Planner {plan_info.name} Subscription",
                        },
                        "recurring": {
                            "interval": "month"
                        }
                    },
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=checkout_request.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=checkout_request.cancel_url,
            metadata={
                "user_id": str(current_user.id),
                "plan": plan
            },
            customer_email=current_user.email,
            billing_address_collection="auto",
            payment_method_collection="always",
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id),
                    "plan": plan
                }
            }
        )
        
        print(f"✅ Checkout session oluşturuldu: {checkout_session.id}")
        print(f"   URL: {checkout_session.url}")
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id,
            "demo": False
        }
    
    except Exception as e:
        print(f"❌ Checkout hatası: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Stripe webhook handler"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = _get_webhook_secret()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Abonelik oluşturuldu - hem checkout.session.completed hem de customer.subscription.created için
    if event["type"] in ["checkout.session.completed", "customer.subscription.created"]:
        # Event type'a göre data objesini al
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            print(f"🎉 Checkout session tamamlandı!")
            print(f"   Session ID: {session.get('id')}")
            print(f"   Customer Email: {session.get('customer_email')}")
            
            # Test event'lerinde metadata olmayabilir
            if "metadata" not in session or "user_id" not in session["metadata"]:
                print("⚠️ Test event veya metadata eksik, atlanıyor")
                return {"status": "success", "message": "Test event ignored"}
            
            user_id = int(session["metadata"]["user_id"])
            plan = session["metadata"]["plan"]
            subscription_id = session.get("subscription")
            customer_id = session.get("customer")
        
        else:  # customer.subscription.created
            subscription_data = event["data"]["object"]
            print(f"🎉 Subscription oluşturuldu!")
            print(f"   Subscription ID: {subscription_data.get('id')}")
            
            # Metadata'dan bilgileri al
            if "metadata" not in subscription_data or "user_id" not in subscription_data["metadata"]:
                print("⚠️ Metadata eksik, atlanıyor")
                return {"status": "success", "message": "Metadata missing"}
            
            user_id = int(subscription_data["metadata"]["user_id"])
            plan = subscription_data["metadata"]["plan"]
            subscription_id = subscription_data.get("id")
            customer_id = subscription_data.get("customer")
        
        print(f"   User ID: {user_id}")
        print(f"   Plan: {plan}")
        
        result = await db.execute(
            select(Subscription).filter(Subscription.user_id == user_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.plan = plan
            subscription.status = "active"
            subscription.amount = PLANS[plan].price
            subscription.stripe_subscription_id = subscription_id
            print(f"   ✅ Subscription güncellendi")
            
            # Give unlimited routes to premium/pro users
            user_result = await db.execute(
                select(User).filter(User.id == user_id)
            )
            user = user_result.scalar_one_or_none()
            if user:
                old_routes = user.remaining_routes
                user.remaining_routes = -1  # Unlimited
                print(f"   ✅ User routes güncellendi: {old_routes} -> -1 (unlimited)")
            
            await db.commit()
            print(f"🎊 Webhook işlendi ve commit edildi!")
        else:
            print(f"   ⚠️ Subscription bulunamadı, yeni oluşturuluyor...")
            # Create new subscription
            new_subscription = Subscription(
                user_id=user_id,
                stripe_customer_id=customer_id,
                stripe_subscription_id=subscription_id,
                plan=plan,
                status="active",
                amount=PLANS[plan].price,
                currency="usd"
            )
            db.add(new_subscription)
            
            # Give unlimited routes
            user_result = await db.execute(
                select(User).filter(User.id == user_id)
            )
            user = user_result.scalar_one_or_none()
            if user:
                user.remaining_routes = -1
                print(f"   ✅ User routes güncellendi: -1 (unlimited)")
            
            await db.commit()
            print(f"🎊 Yeni subscription oluşturuldu ve commit edildi!")
    
    # Abonelik yenilendi
    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        subscription_id = invoice["subscription"]
        
        result = await db.execute(
            select(Subscription).filter(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.status = "active"
            # Stripe'dan period bilgisi al
            stripe_sub = stripe.Subscription.retrieve(subscription_id)
            subscription.current_period_start = datetime.fromtimestamp(
                stripe_sub.current_period_start
            )
            subscription.current_period_end = datetime.fromtimestamp(
                stripe_sub.current_period_end
            )
            await db.commit()
    
    # Abonelik iptal edildi
    elif event["type"] == "customer.subscription.deleted":
        stripe_subscription = event["data"]["object"]
        subscription_id = stripe_subscription["id"]
        
        result = await db.execute(
            select(Subscription).filter(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.plan = "free"
            subscription.status = "canceled"
            subscription.amount = 0.0
            subscription.stripe_subscription_id = None
            
            # Reset to 0 routes when subscription cancelled
            user_result = await db.execute(
                select(User).filter(User.id == subscription.user_id)
            )
            user = user_result.scalar_one_or_none()
            if user:
                user.remaining_routes = 0  # No more free routes
            
            await db.commit()
    
    return {"status": "success"}


@router.post("/cancel")
async def cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mevcut aboneliği iptal et"""
    result = await db.execute(
        select(Subscription).filter(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.plan == "free":
        raise HTTPException(status_code=400, detail="Aktif abonelik yok")
    
    if not subscription.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="Stripe abonelik ID bulunamadı")
    
    try:
        # Stripe'da aboneliği iptal et (dönem sonunda)
        stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        subscription.cancel_at_period_end = True
        await db.commit()
        
        return {
            "message": "Abonelik dönem sonunda iptal edilecek",
            "current_period_end": subscription.current_period_end
        }
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
