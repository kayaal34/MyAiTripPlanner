import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Sistem Nasıl Çalışıyor?",
        answer: "Şehir, gün sayısı, bütçe ve ilgi alanı bilgilerinizi girdikten sonra yapay zeka sizin için gün gün bir rota oluşturur. Plan içinde gezilecek yerler, yemek önerileri ve günlük akış bulunur.",
    },
    {
        question: "Plan oluşturmak için üye olmam gerekiyor mu?",
        answer: "Evet. Planları kaydetmek, geçmişe erişmek ve kişisel öneriler almak için giriş yapmanız gerekir.",
    },
    {
        question: "Oluşturulan Plan Neler İçeriyor?",
        answer: "Planlar genellikle sabah-öğle-akşam akışı, önerilen mekanlar, kısa açıklamalar, yaklaşık bütçe notları ve seyahatinizi kolaylaştıracak pratik tavsiyeleri içerir.",
    },
    {
        question: "Planımı Kaydedebilir veya Değiştirebilir miyim?",
        answer: "Evet. Oluşturduğunuz planları hesabınıza kaydedebilir, daha sonra açıp tekrar inceleyebilirsiniz. Yeni tercihlerinize göre tekrar plan üretip farklı versiyonlar oluşturabilirsiniz.",
    },
    {
        question: "Free, Premium ve Pro planlar arasındaki fark nedir?",
        answer: "Free plan sınırlı rota hakkı sunar. Premium ve Pro planlarda daha gelişmiş özellikler ve sınırsız rota avantajı bulunur.",
    },
    {
        question: "Premium’a nasıl geçebilirim ve aboneliği iptal edebilir miyim?",
        answer: "Fiyatlandırma sayfasından plan seçip ödeme adımını tamamlayabilirsiniz. Aktif aboneliğinizi yine hesap/fiyatlandırma alanından iptal edebilirsiniz.",
    },
    {
        question: "Kalan rota hakkımı nereden görebilirim?",
        answer: "Giriş yaptıktan sonra üst menüdeki hesap bölümünde kalan rota sayınızı görebilirsiniz.",
    },
    {
        question: "Verilerim Güvende mi?",
        answer: "Güvenlik bizim için önceliklidir. Kimlik doğrulama, oturum yönetimi ve ödeme işlemleri güvenli altyapılarla yürütülür. Ödeme bilgileri Stripe üzerinden işlenir.",
    },
    {
        question: "Yapay Zeka Hata Yapar mı?",
        answer: "Yapay zeka önerileri çok güçlüdür ancak her zaman son kontrol kullanıcıya aittir. Özellikle çalışma saatleri, rezervasyon durumu ve güncel fiyatları seyahatten önce doğrulamanızı öneririz.",
    },
    {
        question: "Hangi şehirler için plan oluşturabilirim?",
        answer: "Türkiye ve dünyadan birçok şehir için plan oluşturabilirsiniz. Şehirler listesi düzenli olarak güncellenir.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mx-auto max-w-screen-xl px-6 py-20">
            {/* Header */}
            <div className="mb-10 text-center">
                <h2 className="mb-3 text-5xl font-display font-semibold text-[#1f2a44]">
                    Aklınızda Soru Kalmasın
                </h2>
                <p className="text-lg text-gray-600 font-normal">
                    Tatil Planlama hakkında en çok merak edilenler.
                </p>
            </div>

            {/* Accordion */}
            <div className="space-y-3">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl px-5 py-4"
                    >
                        {/* Question Button */}
                        <button
                            onClick={() => toggleAccordion(index)}
                            className="flex w-full items-center justify-between text-left transition-all duration-300"
                        >
                            <h3 className="pr-8 text-lg md:text-xl font-semibold text-[#1e293b]">
                                {item.question}
                            </h3>
                            <div className="flex-shrink-0">
                                {openIndex === index ? (
                                    <Minus className="h-6 w-6 text-[#1e293b] transition-all duration-300" />
                                ) : (
                                    <Plus className="h-6 w-6 text-[#1e293b] transition-all duration-300" />
                                )}
                            </div>
                        </button>

                        {/* Answer Content */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ${
                                openIndex === index
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
            <div className="mt-10 text-center">
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
