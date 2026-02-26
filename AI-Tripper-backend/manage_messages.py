"""
📬 İnteraktif Contact Mesaj Yönetimi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kullanım: python manage_messages.py
veya: python manage.py (alias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# ANSI renk kodları (Windows PowerShell uyumlu)
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def print_header(text):
    """Başlık yazdır"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(70)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.END}\n")

def print_success(text):
    """Başarı mesajı"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    """Hata mesajı"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_info(text):
    """Bilgi mesajı"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")

def print_warning(text):
    """Uyarı mesajı"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

class MessageManager:
    def __init__(self):
        self.conn = None
        
    async def connect(self):
        DATABASE_URL = os.getenv("DATABASE_URL")
        if DATABASE_URL and "postgresql+asyncpg://" in DATABASE_URL:
            DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        self.conn = await asyncpg.connect(DATABASE_URL)
        
    async def close(self):
        if self.conn:
            await self.conn.close()
            
    async def show_stats(self):
        """İstatistikleri göster"""
        total = await self.conn.fetchval("SELECT COUNT(*) FROM contact_messages")
        unread = await self.conn.fetchval("SELECT COUNT(*) FROM contact_messages WHERE is_read = false")
        
        print_header("📊 MESAJ İSTATİSTİKLERİ")
        print(f"{Colors.BOLD}📬 Toplam Mesaj:{Colors.END} {Colors.CYAN}{total}{Colors.END}")
        print(f"{Colors.BOLD}📧 Okunmamış:{Colors.END} {Colors.YELLOW}{unread}{Colors.END}")
        print(f"{Colors.BOLD}✅ Okunmuş:{Colors.END} {Colors.GREEN}{total - unread}{Colors.END}")
        print()
        
    async def list_messages(self, unread_only=False):
        """Mesajları listele"""
        query = """
            SELECT id, name, email, subject, 
                   LEFT(message, 60) as preview,
                   is_read, created_at 
            FROM contact_messages
        """
        if unread_only:
            query += " WHERE is_read = false"
        query += " ORDER BY created_at DESC LIMIT 20"
        
        messages = await self.conn.fetch(query)
        
        if not messages:
            print_error("Mesaj bulunamadı!")
            return
            
        title = "📧 OKUNMAMIŞ MESAJLAR" if unread_only else "📬 TÜM MESAJLAR"
        print_header(title)
        
        for msg in messages:
            status_icon = "📧" if not msg['is_read'] else "✅"
            date = msg['created_at'].strftime("%d.%m %H:%M")
            subject = (msg['subject'] or "Konu yok")[:30]
            
            color = Colors.YELLOW if not msg['is_read'] else Colors.GREEN
            print(f"{color}{status_icon} [{msg['id']}]{Colors.END} {Colors.BOLD}{msg['name']}{Colors.END} ({msg['email']})")
            print(f"   📌 {subject} | 📅 {date}")
            print()

    async def show_message(self, msg_id):
        """Mesaj detayını göster"""
        msg = await self.conn.fetchrow(
            "SELECT * FROM contact_messages WHERE id = $1", msg_id
        )
        
        if not msg:
            print_error(f"ID {msg_id} olan mesaj bulunamadı!")
            return
            
        print_header(f"📧 MESAJ #{msg['id']}")
        
        status = f"{Colors.GREEN}✅ Okundu{Colors.END}" if msg['is_read'] else f"{Colors.YELLOW}📧 Yeni{Colors.END}"
        print(f"{Colors.BOLD}Durum:{Colors.END} {status}")
        print(f"{Colors.BOLD}Gönderen:{Colors.END} {msg['name']}")
        print(f"{Colors.BOLD}Email:{Colors.END} {msg['email']}")
        print(f"{Colors.BOLD}Konu:{Colors.END} {msg['subject'] or '---'}")
        print(f"{Colors.BOLD}Tarih:{Colors.END} {msg['created_at'].strftime('%d.%m.%Y %H:%M:%S')}")
        print(f"\n{Colors.BOLD}Mesaj:{Colors.END}")
        print(f"{Colors.CYAN}{msg['message']}{Colors.END}\n")
        
    async def mark_as_read(self, msg_id):
        """Mesajı okundu işaretle"""
        result = await self.conn.execute(
            "UPDATE contact_messages SET is_read = true WHERE id = $1", msg_id
        )
        
        if result == "UPDATE 1":
            print_success(f"Mesaj #{msg_id} okundu olarak işaretlendi!")
        else:
            print_error(f"Mesaj #{msg_id} bulunamadı!")
            
    async def mark_all_as_read(self):
        """Tüm mesajları okundu işaretle"""
        result = await self.conn.execute(
            "UPDATE contact_messages SET is_read = true WHERE is_read = false"
        )
        count = int(result.split()[-1])
        print_success(f"{count} mesaj okundu olarak işaretlendi!")
        
    async def delete_message(self, msg_id):
        """Mesajı sil"""
        result = await self.conn.execute(
            "DELETE FROM contact_messages WHERE id = $1", msg_id
        )
        
        if result == "DELETE 1":
            print_success(f"Mesaj #{msg_id} silindi!")
        else:
            print_error(f"Mesaj #{msg_id} bulunamadı!")

async def main():
    manager = MessageManager()
    
    try:
        await manager.connect()
        print_success("Database'e bağlanıldı!")
        
        while True:
            print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
            print(f"{Colors.BOLD}{Colors.BLUE}📬 MESAJ YÖNETİMİ - HIZLI KOMUTLAR{Colors.END}".center(80))
            print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")
            
            print(f"{Colors.CYAN}[s]{Colors.END} İstatistikler  {Colors.CYAN}[l]{Colors.END} Tüm Mesajlar  {Colors.CYAN}[u]{Colors.END} Okunmamışlar")
            print(f"{Colors.CYAN}[r]{Colors.END} Mesaj Oku (ID) {Colors.CYAN}[m]{Colors.END} Okundu İşaretle {Colors.CYAN}[a]{Colors.END} Tümü Okundu")
            print(f"{Colors.CYAN}[d]{Colors.END} Mesaj Sil (ID) {Colors.CYAN}[q]{Colors.END} Çıkış\n")
            
            choice = input(f"{Colors.BOLD}👉 Komut: {Colors.END}").strip().lower()
            
            if choice in ["q", "quit", "exit", "0"]:
                print(f"\n{Colors.GREEN}👋 Görüşmek üzere!{Colors.END}\n")
                break
            elif choice in ["s", "stats", "1"]:
                await manager.show_stats()
            elif choice in ["l", "list", "2"]:
                await manager.list_messages(unread_only=False)
            elif choice in ["u", "unread", "3"]:
                await manager.list_messages(unread_only=True)
            elif choice in ["r", "read", "4"]:
                msg_id = input(f"{Colors.CYAN}Mesaj ID: {Colors.END}").strip()
                if msg_id.isdigit():
                    await manager.show_message(int(msg_id))
                else:
                    print_error("Geçerli bir ID girin!")
            elif choice in ["m", "mark", "5"]:
                msg_id = input(f"{Colors.CYAN}Mesaj ID: {Colors.END}").strip()
                if msg_id.isdigit():
                    await manager.mark_as_read(int(msg_id))
                else:
                    print_error("Geçerli bir ID girin!")
            elif choice in ["a", "all", "6"]:
                confirm = input(f"{Colors.YELLOW}⚠️  Tüm mesajlar okundu işaretlenecek. Emin misiniz? (e/h): {Colors.END}").strip().lower()
                if confirm == "e":
                    await manager.mark_all_as_read()
            elif choice in ["d", "delete", "7"]:
                msg_id = input(f"{Colors.CYAN}Silinecek Mesaj ID: {Colors.END}").strip()
                if msg_id.isdigit():
                    confirm = input(f"{Colors.YELLOW}⚠️  Mesaj #{msg_id} silinecek. Emin misiniz? (e/h): {Colors.END}").strip().lower()
                    if confirm == "e":
                        await manager.delete_message(int(msg_id))
                else:
                    print_error("Geçerli bir ID girin!")
            else:
                print_error("Geçersiz komut! Tekrar deneyin.")
                
    except KeyboardInterrupt:
        print(f"\n\n{Colors.GREEN}👋 Program kapatıldı!{Colors.END}\n")
    except Exception as e:
        print_error(f"Hata: {e}")
    finally:
        await manager.close()

if __name__ == "__main__":
    asyncio.run(main())
