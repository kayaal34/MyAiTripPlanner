import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { sendContactMessage } from "../services/api";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await sendContactMessage({
                name: formData.name,
                email: formData.email,
                subject: formData.subject || undefined,
                message: formData.message
            });

            setSubmitted(true);
        } catch (err) {
            console.error("Failed to send message:", err);
            setError(err instanceof Error ? err.message : "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans py-16">
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 mt-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-display font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow-sm">Свяжитесь с Нами</h1>
                    <p className="text-xl text-gray-500 font-medium">
                        Мы всегда рады ответить на ваши вопросы и предложения
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 h-full">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Информация</h2>

                            <div className="space-y-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                                        <Mail className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 mb-1 text-lg">Email</h3>
                                        <a
                                            href="mailto:contact@aitripplanner.com"
                                            className="text-gray-600 font-medium hover:text-orange-600 transition-colors inline-block"
                                        >
                                            contact@aitripplanner.com
                                        </a>
                                        <p className="text-gray-400 text-sm mt-1 font-medium">
                                            Ответим в течение 24 часов
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                                        <Phone className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 mb-1 text-lg">Телефон</h3>
                                        <a
                                            href="tel:+74951234567"
                                            className="text-gray-600 font-medium hover:text-orange-600 transition-colors inline-block"
                                        >
                                            +7 (495) 123-45-67
                                        </a>
                                        <p className="text-gray-400 text-sm mt-1 font-medium">
                                            Пн-Пт: 9:00 - 18:00 (МСК)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                                        <MapPin className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 mb-1 text-lg">Адрес</h3>
                                        <p className="text-gray-600 font-medium leading-relaxed">
                                            г. Москва, ул. Тверская, д. 1<br />
                                            Офис 123, 125009
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-10 pt-8 border-t border-gray-100">
                                <h3 className="font-extrabold text-gray-900 mb-5">Мы в Соцсетях</h3>
                                <div className="flex gap-4">
                                    <a
                                        href="#"
                                        className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all text-gray-500 group"
                                    >
                                        <span className="font-bold group-hover:text-orange-600 transition-colors text-sm">FB</span>
                                    </a>
                                    <a
                                        href="#"
                                        className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all text-gray-500 group"
                                    >
                                        <span className="font-bold group-hover:text-orange-600 transition-colors text-sm">IG</span>
                                    </a>
                                    <a
                                        href="#"
                                        className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all text-gray-500 group"
                                    >
                                        <span className="font-bold group-hover:text-orange-600 transition-colors text-sm">TW</span>
                                    </a>
                                </div>
                            </div>

                            {/* Map Image */}
                            <div className="mt-10 relative">
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 pointer-events-none z-10"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600"
                                    alt="Office Location"
                                    className="rounded-2xl w-full h-56 object-cover shadow-sm"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 h-full">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Напишите Нам</h2>

                            {error && (
                                <div className="mb-6 bg-red-50/80 border border-red-200 rounded-2xl p-5">
                                    <p className="text-red-700 font-bold text-sm flex items-center gap-2">
                                        <span className="text-xl">⚠️</span> {error}
                                    </p>
                                </div>
                            )}

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 border border-green-200 rounded-3xl p-10 text-center h-full flex flex-col justify-center items-center"
                                >
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                        <Send className="w-10 h-10 text-white ml-2" />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-green-800 mb-3 tracking-tight">Спасибо!</h3>
                                    <p className="text-green-700 font-medium text-lg leading-relaxed mb-6">
                                        Ваше сообщение успешно отправлено.<br />Мы свяжемся с вами в ближайшее время.
                                    </p>
                                    <p className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold">
                                        ✓ Сохранено в системе
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">
                                            Ваше Имя *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            disabled={isSubmitting}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all disabled:opacity-50 font-medium text-gray-900"
                                            placeholder="Иван Иванов"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={isSubmitting}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all disabled:opacity-50 font-medium text-gray-900"
                                            placeholder="ivan@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">
                                            Тема
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all disabled:opacity-50 font-medium text-gray-900"
                                            placeholder="Вопрос о планировании"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">
                                            Сообщение *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            disabled={isSubmitting}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all resize-none disabled:opacity-50 font-medium text-gray-900"
                                            placeholder="Расскажите нам, чем мы можем помочь..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                    >
                                        {isSubmitting ? (
                                            "Отправка..."
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 ml-1" />
                                                <span>Отправить Сообщение</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
