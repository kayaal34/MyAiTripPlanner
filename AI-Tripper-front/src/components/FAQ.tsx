import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Plan oluşturmak için üye olmam gerekiyor mu?",
        answer: "Evet. Kişiye özel rota üretimi, kaydetme ve geçmiş takibi için giriş yapmanız gerekiyor. Bu sayede planlarınız hesabınızda güvenli şekilde saklanır.",
    },
    {
        question: "Free, Premium ve Pro planlar arasındaki fark nedir?",
        answer: "Free plan temel kullanım içindir ve rota hakkı sınırlıdır. Premium ve Pro planlarda daha gelişmiş özellikler ve sınırsız rota avantajı sunulur.",
    },
    {
        question: "Kalan rota hakkımı nereden görebilirim?",
        answer: "Giriş yaptıktan sonra üst menüdeki hesap alanında kalan rota hakkınızı görebilirsiniz. Planınız Premium veya Pro ise sınırsız kullanım aktif olur.",
    },
    {
        question: "Premium’a nasıl geçebilirim?",
        answer: "Premium sayfasından plan seçip güvenli ödeme adımlarını tamamlayabilirsiniz. Ödeme sonrası aboneliğiniz hesabınıza otomatik olarak tanımlanır.",
    },
    {
        question: "Aboneliğimi iptal edebilir miyim?",
        answer: "Evet. Aktif bir ücretli planınız varsa aboneliği iptal etme seçeneğini kullanabilirsiniz. İptal, mevcut fatura döneminin sonunda devreye girer.",
    },
    {
        question: "Ödemeler güvenli mi?",
        answer: "Evet. Ödemeler Stripe altyapısı üzerinden işlenir. Kart bilgileriniz doğrudan ödeme sağlayıcısı tarafından yönetilir, uygulama içinde kart verisi saklanmaz.",
    },
    {
        question: "Planlarımı kaydedebilir ve sonra tekrar açabilir miyim?",
        answer: "Evet. Oluşturduğunuz planları kaydedebilir, daha sonra Hesabım bölümünden tekrar görüntüleyebilirsiniz.",
    },
    {
        question: "AI önerileri neye göre hazırlanıyor?",
        answer: "Öneriler; şehir, gün sayısı, ilgi alanları, bütçe ve seyahat tipi bilgilerinize göre oluşturulur. Amaç, kısa sürede uygulanabilir ve dengeli bir rota sunmaktır.",
    },
    {
        question: "Hangi şehirler için plan oluşturabilirim?",
        answer: "Dünya genelindeki birçok şehir için plan oluşturabilirsiniz. Şehir adını seçerek rota üretimini başlatmanız yeterlidir.",
    },
    {
        question: "Sorun yaşarsam nasıl destek alırım?",
        answer: "İletişim sayfasından mesaj gönderebilir veya destek e-posta adresi üzerinden bize ulaşabilirsiniz. Ücretli planlarda öncelikli destek sağlanır.",
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
                    Sık Sorulan Sorular
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                    Planlar, abonelik ve ödeme hakkında en çok merak edilenler
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
                    Başka sorunuz mu var?{" "}
                    <a
                        href="mailto:destek@myaitripplanner.com"
                        className="font-semibold text-[#1e3a8a] transition-colors duration-300 hover:text-blue-700"
                    >
                        Bizimle iletişime geçin
                    </a>
                </p>
            </div>
        </section>
    );
}
