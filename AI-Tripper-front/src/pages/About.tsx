import { motion } from "framer-motion";
import { Heart, Globe, Users, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            {/* Hero Section */}
            <div className="relative h-[60vh] overflow-hidden mt-20">
                <img
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"
                    alt="Travel"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"></div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-center"
                >
                    <div>
                        <h1 className="text-6xl font-display font-extrabold text-white mb-4">О Нас</h1>
                        <p className="text-2xl text-white/90 font-medium">Мы делаем путешествия доступными для всех</p>
                    </div>
                </motion.div>
            </div>

            {/* Story Section */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-3xl shadow-2xl p-12 mb-16"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="w-8 h-8 text-red-500" />
                        <h2 className="text-4xl font-display font-bold text-gray-800">Наша История</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p className="text-lg">
                                Всё началось с простой идеи: <span className="font-semibold text-blue-600">путешествия должны быть доступными каждому</span>, 
                                независимо от опыта планирования или бюджета.
                            </p>
                            <p className="text-lg">
                                В 2024 году группа увлечённых путешественников и технологических энтузиастов объединилась, 
                                чтобы создать платформу, которая использует <span className="font-semibold text-purple-600">искусственный интеллект</span> для 
                                персонализированного планирования маршрутов.
                            </p>
                            <p className="text-lg">
                                Мы поняли, что многие люди мечтают о путешествиях, но не знают, с чего начать. 
                                Часы исследований, бесконечные вкладки браузера, противоречивые отзывы... 
                                Мы решили <span className="font-semibold text-green-600">упростить этот процесс</span>.
                            </p>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600"
                                alt="Team"
                                className="rounded-2xl shadow-xl w-full"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
                                2+ года инноваций
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mission Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Globe className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Глобальный Охват</h3>
                        <p className="text-gray-600">
                            Планируйте поездки в любую точку мира с учётом местных особенностей и культуры.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
                    >
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Персонализация</h3>
                        <p className="text-gray-600">
                            Умный алгоритм учитывает ваши интересы, бюджет и стиль путешествий.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Сообщество</h3>
                        <p className="text-gray-600">
                            Присоединяйтесь к тысячам путешественников, которые уже открыли для себя мир.
                        </p>
                    </motion.div>
                </div>

                {/* Values Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
                >
                    <h2 className="text-4xl font-bold mb-8 text-center">Наши Ценности</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-3">🎯 Простота</h3>
                            <p className="text-white/90">
                                Планирование путешествия должно быть простым и интуитивно понятным, 
                                а не стрессовым и запутанным.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3">🚀 Инновации</h3>
                            <p className="text-white/90">
                                Мы постоянно совершенствуем наши алгоритмы, чтобы предложить вам 
                                лучшие маршруты и рекомендации.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3">💎 Качество</h3>
                            <p className="text-white/90">
                                Каждая рекомендация тщательно проверяется, чтобы обеспечить 
                                незабываемые впечатления.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3">🌍 Устойчивость</h3>
                            <p className="text-white/90">
                                Мы поощряем ответственный туризм и заботу об окружающей среде 
                                в каждом путешествии.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Team Image */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200"
                        alt="Our Team"
                        className="rounded-3xl shadow-2xl w-full max-h-96 object-cover"
                    />
                    <p className="mt-6 text-2xl font-bold text-gray-800">
                        Присоединяйтесь к нам в путешествии! ✈️
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
