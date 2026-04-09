import { motion } from "framer-motion";
import { Heart, Globe, Users, Sparkles, Target, Rocket, Gem, Leaf } from "lucide-react";
import Navbar from "../components/Navbar";

export default function About() {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            <Navbar />
            {/* Hero Section */}
            <div className="relative h-[60vh] overflow-hidden mt-20">
                <img
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"
                    alt="Travel"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30"></div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-center"
                >
                    <div>
                        <h1 className="text-6xl font-display font-extrabold text-white mb-4 drop-shadow-md tracking-tight">О Нас</h1>
                        <p className="text-2xl text-white/90 font-medium drop-shadow">Мы делаем путешествия доступными для всех</p>
                    </div>
                </motion.div>
            </div>

            {/* Story Section */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white border border-gray-200 rounded-3xl shadow-sm p-12 mb-16 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Heart className="w-64 h-64 text-orange-600 -mt-16 -mr-16" />
                    </div>

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <Heart className="w-8 h-8 text-orange-500 fill-orange-500" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Наша История</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="space-y-6 text-gray-600 leading-relaxed font-medium">
                            <p className="text-lg">
                                Всё началось с простой идеи: <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">путешествия должны быть доступными каждому</span>,
                                независимо от опыта планирования или бюджета.
                            </p>
                            <p className="text-lg">
                                В 2024 году группа увлечённых путешественников и технологических энтузиастов объединилась,
                                чтобы создать платформу, которая использует <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">искусственный интеллект</span> для
                                персонализированного планирования маршрутов.
                            </p>
                            <p className="text-lg">
                                Мы поняли, что многие люди мечтают о путешествиях, но не знают, с чего начать.
                                Часы исследований, бесконечные вкладки браузера, противоречивые отзывы...
                                Мы решили <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">упростить этот процесс</span>.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="bg-white p-2 rounded-3xl shadow-lg border border-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600"
                                    alt="Team"
                                    className="rounded-2xl w-full"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-orange-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-orange-500/25 border-4 border-white">
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
                        className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                            <Globe className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Глобальный Охват</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Планируйте поездки в любую точку мира с учётом местных особенностей и культуры.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">AI Персонализация</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Умный алгоритм учитывает ваши интересы, бюджет и стиль путешествий.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Сообщество</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Присоединяйтесь к тысячам путешественников, которые уже открыли для себя мир.
                        </p>
                    </motion.div>
                </div>

                {/* Values Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-orange-50/50 backdrop-blur-sm border border-orange-100/50 rounded-3xl p-12 text-gray-900 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-4xl font-extrabold mb-10 text-center tracking-tight text-gray-900 relative z-10">Наши Ценности</h2>
                    <div className="grid md:grid-cols-2 gap-10 relative z-10">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                                <span className="p-2 bg-orange-100/50 rounded-xl"><Target className="w-6 h-6 text-orange-500" /></span> Простота
                            </h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Планирование путешествия должно быть простым и интуитивно понятным,
                                а не стрессовым и запутанным.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                                <span className="p-2 bg-orange-100/50 rounded-xl"><Rocket className="w-6 h-6 text-orange-500" /></span> Инновации
                            </h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Мы постоянно совершенствуем наши алгоритмы, чтобы предложить вам
                                лучшие маршруты и рекомендации.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                                <span className="p-2 bg-orange-100/50 rounded-xl"><Gem className="w-6 h-6 text-orange-500" /></span> Качество
                            </h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Каждая рекомендация тщательно проверяется, чтобы обеспечить
                                незабываемые впечатления.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                                <span className="p-2 bg-orange-100/50 rounded-xl"><Leaf className="w-6 h-6 text-orange-500" /></span> Устойчивость
                            </h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
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
                    <div className="bg-white p-3 rounded-[2rem] shadow-sm border border-gray-200 inline-block w-full">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200"
                            alt="Our Team"
                            className="rounded-[1.5rem] w-full max-h-[400px] object-cover"
                        />
                    </div>
                    <p className="mt-8 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Присоединяйтесь к нам в путешествии! <span className="inline-block transform hover:scale-110 hover:rotate-12 transition-transform">✈️</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
