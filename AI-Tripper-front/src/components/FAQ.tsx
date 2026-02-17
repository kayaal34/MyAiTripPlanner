import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "MyAiTripPlanner ücretli mi?",
        answer: "Hayır, servisimiz tamamen ücretsizdir. Amacımız, karmaşık planlama süreçlerini yapay zeka desteğiyle herkes için erişilebilir kılmaktır.",
    },
    {
        question: "Kayıt olmam gerekiyor mu?",
        answer: "Rota oluşturmak için kayıt olmanız zorunlu değildir. Ancak oluşturduğunuz rotaları kaydetmek, geçmiş planlarınıza ulaşmak ve kişiselleştirilmiş profilinizi yönetmek için hızlıca kayıt olabilirsiniz.",
    },
    {
        question: "Nasıl rota oluşturabilirim?",
        answer: "Ana sayfamızdaki formu doldurarak (hedef şehir, süre, bütçe ve ilgi alanları) 'Haydi Planla!' butonuna basmanız yeterli. GPT-4o destekli akıllı modülümüz saniyeler içinde size özel rotayı hazırlayacaktır.",
    },
    {
        question: "Neden size güvenmeliyim? (Doğruluk Payı)",
        answer: "Geliştirdiğimiz Python tabanlı akıllı filtreleme sistemi, sadece popülerliği değil, mekanların güncelliğini ve gerçekliğini de kontrol eder. 'Hayalet' veya kapanmış mekanları rotanızdan uzak tutarak size zaman kazandırır.",
    },
    {
        question: "Önerilen mekanların bütçeme uygunluğunu nasıl sağlıyorsunuz?",
        answer: "Algoritmamız, girdiğiniz kişi başı bütçeyi referans alarak restoran ve etkinlik seçimlerini bu sınır dahilinde optimize eder.",
    },
    {
        question: "Hangi şehirler için rota oluşturabilirim?",
        answer: "Dünyanın her yerindeki şehirler için rota oluşturabilirsiniz. Yapay zeka sistemimiz, belirlediğiniz şehre özgü turistik mekanları, restoranları ve aktiviteleri analiz ederek size en uygun rotayı sunar.",
    },
    {
        question: "Rotamı düzenleyebilir veya değiştirebilir miyim?",
        answer: "Evet, oluşturulan rota bir öneri niteliğindedir. Harita üzerinde sürükle-bırak ile durdurulan yerleri değiştirebilir, ekleme-çıkarma yapabilir ve kendi tercihlerinize göre özelleştirebilirsiniz.",
    },
    {
        question: "Uygulama mobil cihazlarda çalışıyor mu?",
        answer: "Evet! Web tabanlı uygulamamız, mobil, tablet ve masaüstü tüm cihazlarda sorunsuz çalışmaktadır. Responsive tasarımımız sayesinde her ekran boyutunda en iyi deneyimi sunuyoruz.",
    },
    {
        question: "Rotalarımı arkadaşlarımla paylaşabilir miyim?",
        answer: "Kesinlikle! Her rota için benzersiz bir paylaşım linki oluşturabilir, sosyal medyada veya mesajlaşma uygulamaları üzerinden arkadaşlarınızla paylaşabilirsiniz.",
    },
    {
        question: "Yapay zeka hangi kriterlere göre yer öneriyor?",
        answer: "GPT-4o modelimiz, belirttiğiniz ilgi alanları, bütçe, seyahat süresi ve şehir özelliklerini analiz ederek en popüler, güncel ve size uygun mekanları seçiyor. Ayrıca kullanıcı değerlendirmeleri ve mekan güncelliği de dikkate alınmaktadır.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mx-auto max-w-screen-2xl px-8 py-24">
            {/* Header */}
            <div className="mb-24 text-left">
                <h2 className="mb-6 text-6xl font-bold text-[#1e3a8a]">
                    Sıkça Sorulan Sorular
                </h2>
                <p className="text-2xl text-gray-600">
                    Merak ettiğiniz her şeyi burada bulabilirsiniz
                </p>
            </div>

            {/* Accordion */}
            <div className="space-y-0">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="border-b border-gray-200 py-10"
                    >
                        {/* Question Button */}
                        <button
                            onClick={() => toggleAccordion(index)}
                            className="flex w-full items-center justify-between text-left transition-all duration-300 hover:opacity-70"
                        >
                            <h3 className="pr-12 text-3xl font-semibold text-[#1e3a8a]">
                                {item.question}
                            </h3>
                            <div className="flex-shrink-0">
                                {openIndex === index ? (
                                    <Minus className="h-9 w-9 text-[#1e3a8a] transition-all duration-300" />
                                ) : (
                                    <Plus className="h-9 w-9 text-[#1e3a8a] transition-all duration-300" />
                                )}
                            </div>
                        </button>

                        {/* Answer Content */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ${
                                openIndex === index
                                    ? "max-h-96 opacity-100 mt-8"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            <div className="pr-20 pb-6">
                                <p className="text-xl leading-relaxed text-gray-600">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-24 text-left">
                <p className="text-xl text-gray-600">
                    Başka bir sorunuz mu var?{" "}
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
