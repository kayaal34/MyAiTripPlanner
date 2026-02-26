"""
Contact mesajlarını database'den kontrol et
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def check_messages():
    # Database bağlantısı
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # SQLAlchemy formatından asyncpg formatına çevir
    # postgresql+asyncpg:// -> postgresql://
    if DATABASE_URL and "postgresql+asyncpg://" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Tablo var mı kontrol et
        table_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'contact_messages'
            );
        """)
        
        if not table_exists:
            print("❌ contact_messages tablosu henüz oluşturulmamış!")
            print("💡 Backend'i başlatın: uvicorn main:app --reload")
            return
        
        print("✅ contact_messages tablosu mevcut\n")
        
        # Toplam mesaj sayısı
        total = await conn.fetchval("SELECT COUNT(*) FROM contact_messages")
        print(f"📊 Toplam mesaj sayısı: {total}")
        
        # Okunmamış mesaj sayısı
        unread = await conn.fetchval("SELECT COUNT(*) FROM contact_messages WHERE is_read = false")
        print(f"📬 Okunmamış mesaj sayısı: {unread}")
        print(f"✅ Okunmuş mesaj sayısı: {total - unread}\n")
        
        if total > 0:
            # Son 5 mesajı göster
            messages = await conn.fetch("""
                SELECT id, name, email, subject, message, is_read, created_at 
                FROM contact_messages 
                ORDER BY created_at DESC 
                LIMIT 5
            """)
            
            print("📝 Son 5 Mesaj:")
            print("-" * 80)
            for msg in messages:
                status = "✅ Okundu" if msg['is_read'] else "📧 Yeni"
                print(f"\n[ID: {msg['id']}] {status}")
                print(f"👤 {msg['name']} ({msg['email']})")
                if msg['subject']:
                    print(f"📌 Konu: {msg['subject']}")
                print(f"💬 {msg['message'][:100]}{'...' if len(msg['message']) > 100 else ''}")
                print(f"📅 {msg['created_at']}")
                print("-" * 80)
        else:
            print("ℹ️  Henüz hiç mesaj yok. Contact formunu doldurun!")
            
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_messages())
