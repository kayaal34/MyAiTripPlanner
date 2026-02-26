import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Является ли MyAiTripPlanner платным?",
        answer: "Нет, наш сервис полностью бесплатный. Наша цель — сделать сложные процессы планирования доступными для всех с помощью искусственного интеллекта.",
    },
    {
        question: "Нужно ли мне регистрироваться?",
        answer: "Регистрация не является обязательной для создания маршрутов. Однако вы можете быстро зарегистрироваться, чтобы сохранить созданные маршруты, получить доступ к истории планов и управлять персонализированным профилем.",
    },
    {
        question: "Как я могу создать маршрут?",
        answer: "Просто заполните форму на главной странице (город назначения, продолжительность, бюджет и интересы) и нажмите кнопку 'Поехали!'. Наш интеллектуальный модуль на базе GPT-4o подготовит персональный маршрут за считанные секунды.",
    },
    {
        question: "Почему я должен вам доверять? (Точность данных)",
        answer: "Наша интеллектуальная система фильтрации на Python проверяет не только популярность, но и актуальность и подлинность мест. Мы исключаем 'призрачные' или закрытые заведения из вашего маршрута, экономя ваше время.",
    },
    {
        question: "Как вы обеспечиваете соответствие рекомендуемых мест моему бюджету?",
        answer: "Наш алгоритм оптимизирует выбор ресторанов и мероприятий в пределах указанного вами бюджета на человека.",
    },
    {
        question: "Для каких городов я могу создать маршрут?",
        answer: "Вы можете создавать маршруты для городов по всему миру. Наша система искусственного интеллекта анализирует туристические места, рестораны и активности, характерные для выбранного вами города, и предлагает наиболее подходящий маршрут.",
    },
    {
        question: "Могу ли я редактировать или изменять свой маршрут?",
        answer: "Да, созданный маршрут является рекомендацией. Вы можете изменять остановки с помощью перетаскивания на карте, добавлять или удалять места и настраивать маршрут под свои предпочтения.",
    },
    {
        question: "Работает ли приложение на мобильных устройствах?",
        answer: "Да! Наше веб-приложение без проблем работает на мобильных устройствах, планшетах и настольных компьютерах. Благодаря адаптивному дизайну мы обеспечиваем лучший опыт на любом размере экрана.",
    },
    {
        question: "Могу ли я поделиться маршрутами с друзьями?",
        answer: "Конечно! Вы можете создать уникальную ссылку для каждого маршрута и поделиться ей с друзьями в социальных сетях или мессенджерах.",
    },
    {
        question: "По каким критериям искусственный интеллект рекомендует места?",
        answer: "Наша модель GPT-4o анализирует ваши интересы, бюджет, продолжительность поездки и особенности города, выбирая самые популярные, актуальные и подходящие для вас места. Также учитываются отзывы пользователей и актуальность заведений.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mx-auto max-w-screen-2xl px-8 py-16">
            {/* Header */}
            <div className="mb-12 text-left">
                <h2 className="mb-4 text-5xl font-display font-bold text-gradient">
                    Часто задаваемые вопросы
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                    Здесь вы найдёте всё, что вас интересует
                </p>
            </div>

            {/* Accordion */}
            <div className="space-y-0">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="border-b border-gray-200 py-6"
                    >
                        {/* Question Button */}
                        <button
                            onClick={() => toggleAccordion(index)}
                            className="flex w-full items-center justify-between text-left transition-all duration-300 hover:opacity-70"
                        >
                            <h3 className="pr-8 text-xl font-semibold text-[#1e3a8a]">
                                {item.question}
                            </h3>
                            <div className="flex-shrink-0">
                                {openIndex === index ? (
                                    <Minus className="h-6 w-6 text-[#1e3a8a] transition-all duration-300" />
                                ) : (
                                    <Plus className="h-6 w-6 text-[#1e3a8a] transition-all duration-300" />
                                )}
                            </div>
                        </button>

                        {/* Answer Content */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ${
                                openIndex === index
                                    ? "max-h-96 opacity-100 mt-4"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            <div className="pr-14 pb-4">
                                <p className="text-base leading-relaxed text-gray-600">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-12 text-left">
                <p className="text-base text-gray-600">
                    Есть ещё вопросы?{" "}
                    <a
                        href="mailto:destek@myaitripplanner.com"
                        className="font-semibold text-[#1e3a8a] transition-colors duration-300 hover:text-blue-700"
                    >
                        Свяжитесь с нами
                    </a>
                </p>
            </div>
        </section>
    );
}
