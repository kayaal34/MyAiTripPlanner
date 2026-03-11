"""
Kullanıcıları ve İletişim Mesajlarını Kontrol Et
"""
import asyncio
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:trip1234@localhost:5432/aitripper")

def check_data():
    # Sync engine for simple queries
    engine = create_engine(DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"))
    
    with engine.connect() as conn:
        print("=" * 80)
        print("👥 KULLANICILAR (USERS)")
        print("=" * 80)
        
        # Kullanıcıları al
        result = conn.execute(text("""
            SELECT id, username, email, created_at, remaining_routes 
            FROM users 
            ORDER BY created_at DESC
        """))
        
        users = result.fetchall()
        if users:
            for user in users:
                print(f"\n🔹 ID: {user[0]}")
                print(f"   Username: {user[1]}")
                print(f"   Email: {user[2]}")
                print(f"   Kayıt: {user[3]}")
                print(f"   Kalan Rota: {user[4]}")
        else:
            print("\n❌ Henüz kullanıcı yok!")
        
        print("\n" + "=" * 80)
        print("📧 İLETİŞİM MESAJLARI (CONTACT_MESSAGES)")
        print("=" * 80)
        
        # Mesajları al
        result = conn.execute(text("""
            SELECT id, name, email, subject, message, created_at, is_read
            FROM contact_messages 
            ORDER BY created_at DESC
        """))
        
        messages = result.fetchall()
        if messages:
            for msg in messages:
                status = "✅ Okundu" if msg[6] else "📬 Okunmadı"
                print(f"\n{status} | ID: {msg[0]}")
                print(f"   👤 İsim: {msg[1]}")
                print(f"   📧 Email: {msg[2]}")
                print(f"   📌 Konu: {msg[3]}")
                print(f"   💬 Mesaj: {msg[4][:100]}{'...' if len(msg[4]) > 100 else ''}")
                print(f"   📅 Tarih: {msg[5]}")
        else:
            print("\n❌ Henüz mesaj yok!")
        
        print("\n" + "=" * 80)
        print("📊 ÖZET İSTATİSTİKLER")
        print("=" * 80)
        
        # İstatistikler
        stats = conn.execute(text("""
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM contact_messages) as total_messages,
                (SELECT COUNT(*) FROM contact_messages WHERE is_read = false) as unread_messages,
                (SELECT COUNT(*) FROM trips) as total_trips,
                (SELECT COUNT(*) FROM trips WHERE is_saved = true) as saved_trips
        """)).fetchone()
        
        print(f"\n👥 Toplam Kullanıcı: {stats[0]}")
        print(f"📧 Toplam Mesaj: {stats[1]}")
        print(f"📬 Okunmamış Mesaj: {stats[2]}")
        print(f"🗺️ Toplam Plan: {stats[3]}")
        print(f"💾 Kaydedilmiş Plan: {stats[4]}")
        print("\n" + "=" * 80)

if __name__ == "__main__":
    check_data()
