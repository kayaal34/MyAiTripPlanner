import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Burada form gönderimi yapılabilir (backend'e)
        console.log("Form submitted:", formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", subject: "", message: "" });
        }, 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 mt-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-display font-extrabold text-gradient mb-4">Свяжитесь с Нами</h1>
                    <p className="text-xl text-gray-600 font-medium">
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
                        <div className="bg-white rounded-3xl shadow-2xl p-8 h-full">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Информация</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">Email</h3>
                                        <a 
                                            href="mailto:contact@aitripplanner.com" 
                                            className="text-blue-600 hover:underline"
                                        >
                                            contact@aitripplanner.com
                                        </a>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Ответим в течение 24 часов
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">Телефон</h3>
                                        <a 
                                            href="tel:+74951234567" 
                                            className="text-green-600 hover:underline"
                                        >
                                            +7 (495) 123-45-67
                                        </a>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Пн-Пт: 9:00 - 18:00 (МСК)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">Адрес</h3>
                                        <p className="text-gray-600">
                                            г. Москва, ул. Тверская, д. 1<br />
                                            Офис 123, 125009
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-8 pt-8 border-t">
                                <h3 className="font-bold text-gray-800 mb-4">Мы в Соцсетях</h3>
                                <div className="flex gap-4">
                                    <a 
                                        href="#" 
                                        className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition"
                                    >
                                        <span className="text-blue-600 font-bold">FB</span>
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition"
                                    >
                                        <span className="text-pink-600 font-bold">IG</span>
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center hover:bg-sky-200 transition"
                                    >
                                        <span className="text-sky-600 font-bold">TW</span>
                                    </a>
                                </div>
                            </div>

                            {/* Map Image */}
                            <div className="mt-8">
                                <img
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600"
                                    alt="Office Location"
                                    className="rounded-2xl w-full h-48 object-cover"
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
                        <div className="bg-white rounded-3xl shadow-2xl p-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Напишите Нам</h2>
                            
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center"
                                >
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-700 mb-2">Спасибо!</h3>
                                    <p className="text-green-600">
                                        Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Ваше Имя *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                                            placeholder="Иван Иванов"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                                            placeholder="ivan@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Тема
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                                            placeholder="Вопрос о планировании"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Сообщение *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition resize-none"
                                            placeholder="Расскажите нам, чем мы можем помочь..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        <Send className="w-5 h-5" />
                                        Отправить Сообщение
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
