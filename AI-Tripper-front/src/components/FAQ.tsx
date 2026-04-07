import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Как работает система?",
        answer: "После ввода города, количества дней, бюджета и интересов искусственный интеллект создаст для вас маршрут по дням. План включает места для посещения, рекомендации ресторанов и распорядок дня.",
    },
    {
        question: "Нужно ли мне регистрироваться для создания плана?",
        answer: "Да. Чтобы сохранять планы, получать доступ к истории и персональным рекомендациям, необходимо войти в систему.",
    },
    {
        question: "Что включает в себя созданный план?",
        answer: "Планы обычно включают расписание утро-день-вечер, рекомендуемые места, краткие описания, примерный бюджет и практические советы для вашего путешествия.",
    },
    {
        question: "Могу ли я сохранить или изменить свой план?",
        answer: "Да. Созданные планы можно сохранить в аккаунте, чтобы затем снова их открыть. Вы можете создавать новые версии на основе ваших новых предпочтений.",
    },
    {
        question: "В чем разница между планами Free, Premium и Pro?",
        answer: "План Free предлагает ограниченное количество маршрутов. Планы Premium и Pro включают расширенные функции и преимущество неограниченного создания маршрутов.",
    },
    {
        question: "Как перейти на Premium и могу ли я отменить подписку?",
        answer: "Вы можете выбрать план и завершить оплату на странице цен. Активную подписку можно отменить в разделе аккаунта/цен.",
    },
    {
        question: "Где я могу увидеть количество оставшихся маршрутов?",
        answer: "Войдя в систему, вы можете увидеть количество оставшихся маршрутов в меню пользователя.",
    },
    {
        question: "В безопасности ли мои данные?",
        answer: "Безопасность является нашим приоритетом. Платежная информация обрабатывается через безопасную систему Stripe.",
    },
    {
        question: "Ошибается ли искусственный интеллект?",
        answer: "Рекомендации ИИ очень эффективны, но мы рекомендуем всегда проверять часы работы, доступность бронирования и цены перед поездкой.",
    },
    {
        question: "Для каких городов я могу создать план?",
        answer: "Вы можете создавать планы для множества городов по всему миру. Список городов регулярно обновляется.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full bg-white">
            <section className="mx-auto max-w-screen-xl px-6 py-24 bg-white">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Остались <span className="text-orange-500 italic font-light">вопросы?</span>
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        Часто задаваемые вопросы о планировании отпуска.
                    </p>
                </div>

                {/* Accordion */}
                <div className="space-y-3">
                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className={`bg-white border rounded-xl px-5 py-4 transition-all duration-300 shadow-sm ${openIndex === index ? "border-orange-500 shadow-orange-100" : "border-gray-200 hover:border-orange-300"}`}
                        >
                            {/* Question Button */}
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="flex w-full items-center justify-between text-left transition-all duration-300 group"
                            >
                                <h3 className={`pr-8 text-lg md:text-xl font-semibold transition-colors duration-300 ${openIndex === index ? "text-orange-500" : "text-gray-800"}`}>
                                    {item.question}
                                </h3>
                                <div className="flex-shrink-0">
                                    {openIndex === index ? (
                                        <Minus className="h-6 w-6 text-orange-500 transition-all duration-300" />
                                    ) : (
                                        <Plus className="h-6 w-6 text-orange-400 group-hover:text-orange-500 transition-all duration-300" />
                                    )}
                                </div>
                            </button>

                            {/* Answer Content */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index
                                    ? "max-h-96 opacity-100 mt-3"
                                    : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="pr-14 pb-2">
                                    <p className="text-lg leading-8 text-gray-600">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center">
                    <p className="text-base text-gray-600">
                        Остались другие вопросы?{" "}
                        <a
                            href="mailto:destek@myaitripplanner.com"
                            className="font-semibold text-orange-500 transition-colors duration-300 hover:text-orange-600"
                        >
                            Свяжитесь с нами
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}

