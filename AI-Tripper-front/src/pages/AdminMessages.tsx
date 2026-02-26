import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
    getContactMessages, 
    markMessageAsRead,
    type ContactMessageResponse 
} from "../services/api";
import { Mail, MailOpen, Calendar, User, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminMessages() {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [selectedMessage, setSelectedMessage] = useState<ContactMessageResponse | null>(null);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        loadMessages();
    }, [token, navigate, filter]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await getContactMessages(token!, filter === "unread");
            setMessages(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load messages:", err);
            setError(err instanceof Error ? err.message : "Mesajlar yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (messageId: number) => {
        try {
            const updatedMessage = await markMessageAsRead(messageId, token!);
            
            // State'i güncelle
            setMessages(messages.map(msg => 
                msg.id === messageId ? updatedMessage : msg
            ));
            
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(updatedMessage);
            }
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleMessageClick = (message: ContactMessageResponse) => {
        setSelectedMessage(message);
        
        // Eğer okunmamışsa, okundu işaretle
        if (!message.is_read) {
            handleMarkAsRead(message.id);
        }
    };

    if (!user) {
        return null;
    }

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 px-6">
            <Navbar />
            <div className="max-w-7xl mx-auto mt-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">📬 İletişim Mesajları</h1>
                    <p className="text-gray-600">
                        Kullanıcılardan gelen mesajları görüntüleyin ve yönetin
                    </p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </motion.div>
                )}

                {/* Filter Buttons */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            filter === "all"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Tümü ({messages.length})
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                            filter === "unread"
                                ? "bg-orange-600 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <Mail className="w-4 h-4" />
                        Okunmamış ({unreadCount})
                    </button>
                </div>

                {/* Messages Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Messages List */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-h-[700px] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Mesaj Listesi</h2>
                        
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                                <p className="text-gray-500 mt-4">Yükleniyor...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12">
                                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {filter === "unread" ? "Okunmamış mesaj yok" : "Henüz mesaj yok"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => handleMessageClick(message)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                            selectedMessage?.id === message.id
                                                ? "border-blue-500 bg-blue-50"
                                                : message.is_read
                                                ? "border-gray-200 bg-gray-50 hover:bg-gray-100"
                                                : "border-orange-200 bg-orange-50 hover:bg-orange-100"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {message.is_read ? (
                                                    <MailOpen className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                    <Mail className="w-4 h-4 text-orange-600" />
                                                )}
                                                <h3 className="font-bold text-gray-800">{message.name}</h3>
                                            </div>
                                            {!message.is_read && (
                                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                                        
                                        {message.subject && (
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                {message.subject}
                                            </p>
                                        )}
                                        
                                        <p className="text-sm text-gray-500 truncate">
                                            {message.message.substring(0, 80)}...
                                        </p>
                                        
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(message.created_at).toLocaleString('tr-TR')}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message Detail */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Mesaj Detayı</h2>
                        
                        {selectedMessage ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                {/* Header */}
                                <div className="border-b pb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-2xl font-bold text-gray-800">
                                            {selectedMessage.name}
                                        </h3>
                                        {selectedMessage.is_read ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Okundu
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                Yeni
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <User className="w-4 h-4" />
                                        <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedMessage.created_at).toLocaleString('tr-TR', {
                                            dateStyle: 'long',
                                            timeStyle: 'short'
                                        })}
                                    </div>
                                </div>

                                {/* Subject */}
                                {selectedMessage.subject && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 mb-1">Konu:</h4>
                                        <p className="text-lg font-semibold text-gray-800">
                                            {selectedMessage.subject}
                                        </p>
                                    </div>
                                )}

                                {/* Message */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Mesaj:
                                    </h4>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t">
                                    {!selectedMessage.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(selectedMessage.id)}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Okundu Olarak İşaretle
                                        </button>
                                    )}
                                    
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'İletişim Mesajınız'}`}
                                        className="mt-3 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Email ile Yanıtla
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center py-20">
                                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Mesaj seçin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
