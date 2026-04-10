import { memo, useCallback, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import Navbar from '../components/Navbar';

// Mock Data - Genişletilmiş şehir listesi
interface City {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  placesToSee: string[];
}

const FALLBACK_CITY_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80';

const cities: City[] = [
  {
    id: 'istanbul',
    name: 'Стамбул',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    description: 'Уникальный город с историческим полуостровом и видом на Босфор.',
    placesToSee: ['Собор Святой Софии', 'Дворец Топкапы', 'Галатская башня'],
  },
  {
    id: 'antalya',
    name: 'Анталья',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1582634578140-83f53f3f9f8f?w=800&q=80',
    description: 'Популярный курорт со средиземноморским побережьем и теплым климатом.',
    placesToSee: ['Калеичи', 'Водопад Дюден', 'Пляж Коньяалты'],
  },
  {
    id: 'izmir',
    name: 'Измир',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    description: 'Эгейский бриз, набережная Кордон и приятная городская жизнь.',
    placesToSee: ['Кордон', 'Часовая башня', 'Исторический лифт'],
  },
  {
    id: 'mugla',
    name: 'Мугла',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    description: 'Популярный центр побережья Фетхие, Бодрума и Мармариса.',
    placesToSee: ['Акяка', 'Олюдениз', 'Датча'],
  },
  {
    id: 'roma',
    name: 'Рим',
    country: 'Италия',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    description: 'Столица истории, полная античных руин и площадей.',
    placesToSee: ['Колизей', 'Фонтан Треви', 'Пантеон'],
  },
  {
    id: 'paris',
    name: 'Париж',
    country: 'Франция',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    description: 'Иконический город искусства, моды и романтических улиц.',
    placesToSee: ['Эйфелева башня', 'Лувр', 'Монмартр'],
  },
  {
    id: 'saraybosna',
    name: 'Сараево',
    country: 'Босния и Герцеговина',
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
    description: 'Балканский город, где встречаются восточная и западная культуры.',
    placesToSee: ['Башчаршия', 'Латинский мост', 'Желтый форт'],
  },
  {
    id: 'dubai',
    name: 'Дубай',
    country: 'ОАЭ',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    description: 'Направление, выделяющееся современным горизонтом и роскошью.',
    placesToSee: ['Бурдж-Халифа', 'Дубай Марина', 'Палм-Джумейра'],
  },
  {
    id: 'trabzon',
    name: 'Трабзон',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80',
    description: 'Место для спокойного отдыха с природой и плато Черного моря.',
    placesToSee: ['Монастырь Сумела', 'Узунгёль', 'Бозтепе'],
  },
  {
    id: 'barselona',
    name: 'Барселона',
    country: 'Испания',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    description: 'Живой средиземноморский город с работами Гауди и береговой линией.',
    placesToSee: ['Храм Святого Семейства', 'Парк Гуэль', 'Ла Рамбла'],
  },
  {
    id: 'amsterdam',
    name: 'Амстердам',
    country: 'Нидерланды',
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
    description: 'Город каналов, велосипедной культуры и искусства.',
    placesToSee: ['Площадь Дам', 'Музей Ван Гога', 'Рейксмюсеум'],
  },
  {
    id: 'tiflis',
    name: 'Тбилиси',
    country: 'Грузия',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    description: 'Своеобразный маршрут с историческими улицами и термальными банями.',
    placesToSee: ['Крепость Нарикала', 'Старый Тбилиси', 'Проспект Руставели'],
  },
  {
    id: 'moskova',
    name: 'Москва',
    country: 'Россия',
    imageUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80',
    description: 'Мощный мегаполис с Красной площадью и знаковой архитектурой.',
    placesToSee: ['Красная площадь', 'Кремль', 'Арбат'],
  },
  {
    id: 'berlin',
    name: 'Берлин',
    country: 'Германия',
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
    description: 'Центр истории, ночной жизни и творческой культуры.',
    placesToSee: ['Бранденбургские ворота', 'Берлинская стена', 'Музейный остров'],
  },
  {
    id: 'atina',
    name: 'Афины',
    country: 'Греция',
    imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
    description: 'Объединяет античные руины с современной городской жизнью.',
    placesToSee: ['Акрополь', 'Район Плака', 'Площадь Синтагма'],
  },
  {
    id: 'sanliurfa',
    name: 'Шанлыурфа',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
    description: 'Культурный маршрут с Гебекли-Тепе и исторической атмосферой.',
    placesToSee: ['Озеро Балыклыгёль', 'Гёбекли-Тепе', 'Крепость Урфы'],
  },
  {
    id: 'gaziantep',
    name: 'Газиантеп',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&q=80',
    description: 'Знаменит вкусными заведениями и богатой кулинарной культурой.',
    placesToSee: ['Музей Зевгма', 'Рынок медников', 'Крепость Газиантепа'],
  },
  {
    id: 'venedik',
    name: 'Венеция',
    country: 'Италия',
    imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    description: 'Романтический город с каналами и турами на гондолах.',
    placesToSee: ['Площадь Сан-Марко', 'Мост Риальто', 'Гранд-канал'],
  },
  {
    id: 'londra',
    name: 'Лондон',
    country: 'Великобритания',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    description: 'Мировой мегаполис с культурой, музеями и классическим силуэтом.',
    placesToSee: ['Биг-Бен', 'Лондонский глаз', 'Тауэрский мост'],
  },
  {
    id: 'bodrum',
    name: 'Бодрум',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80',
    description: 'Популярен своими белыми домами, пристанью и ночной жизнью.',
    placesToSee: ['Замок Святого Петра', 'Марина', 'Ялыкавак'],
  },
  {
    id: 'mardin',
    name: 'Мардин',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1518991791750-749b7d5ef71d?w=800&q=80',
    description: 'Уникальный город с каменной архитектурой и видами на Месопотамию.',
    placesToSee: ['Старый Мардин', 'Монастырь Дейрулзафаран', 'Медресе Зинджирие'],
  },
  {
    id: 'lizbon',
    name: 'Лиссабон',
    country: 'Португалия',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    description: 'Приятный маршрут с цветными трамваями и видами с холмов.',
    placesToSee: ['Алфама', 'Белен', 'Площадь Росиу'],
  },
  {
    id: 'uskup',
    name: 'Скопье',
    country: 'Северная Македония',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    description: 'Привлекательный балканский город с Каменным мостом и базаром.',
    placesToSee: ['Каменный мост', 'Старая Чаршия', 'Крест Тысячелетия'],
  },
  {
    id: 'newyork',
    name: 'Нью-Йорк',
    country: 'США',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    description: 'Культура, искусство и энергия сплетаются в городе, который никогда не спит.',
    placesToSee: ['Таймс-сквер', 'Центральный парк', 'Бруклинский мост'],
  },
  {
    id: 'ankara',
    name: 'Анкара',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    description: 'Столичная атмосфера, музеи и упорядоченная городская жизнь.',
    placesToSee: ['Аныткабир', 'Район Хамамёню', 'Музей анатолийских цивилизаций'],
  },
  {
    id: 'bursa',
    name: 'Бурса',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
    description: 'Выделяется Улудагом, историческими постоялыми дворами и кухней.',
    placesToSee: ['Гора Улудаг', 'Джумалыкызык', 'Коза Хан'],
  },
  {
    id: 'adana',
    name: 'Адана',
    country: 'Турция',
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80',
    description: 'Теплый город со вкусной едой и живописным берегом реки.',
    placesToSee: ['Каменный мост', 'Мечеть Сабанджи', 'Река Джейхан'],
  },
  {
    id: 'madrid',
    name: 'Мадрид',
    country: 'Испания',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
    description: 'Могущественная столица с площадями, музеями и бурной ночной жизнью.',
    placesToSee: ['Пуэрта-дель-Соль', 'Музей Прадо', 'Парк Ретиро'],
  },
  {
    id: 'vienna',
    name: 'Вена',
    country: 'Австрия',
    imageUrl: 'https://images.unsplash.com/photo-1516550893885-98568267b71c?w=800&q=80',
    description: 'Знаменита классической музыкой, дворцами и элегантностью.',
    placesToSee: ['Шёнбрунн', 'Собор Святого Стефана', 'Бельведер'],
  },
  {
    id: 'budapest',
    name: 'Будапешт',
    country: 'Венгрия',
    imageUrl: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?w=800&q=80',
    description: 'Впечатляющий город с берегами Дуная, банями и мостами.',
    placesToSee: ['Здание парламента', 'Цепной мост', 'Будайская крепость'],
  },
  {
    id: 'prag',
    name: 'Прага',
    country: 'Чехия',
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
    description: 'Европейская классика со сказочными улицами и мостами.',
    placesToSee: ['Карлов мост', 'Староместская площадь', 'Пражский Град'],
  },
  {
    id: 'seoul',
    name: 'Сеул',
    country: 'Южная Корея',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7c897b1f1d9b?w=800&q=80',
    description: 'Сочетает в себе технологии, традиции и быстрый темп жизни.',
    placesToSee: ['Кёнбоккун', 'Мёндон', 'Сеульская телебашня'],
  },
  {
    id: 'singapore',
    name: 'Сингапур',
    country: 'Сингапур',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    description: 'Выделяется чистой планировкой города и современной архитектурой.',
    placesToSee: ['Марина Бэй Сэндс', 'Сады у Залива', 'Остров Сентоза'],
  },
  {
    id: 'baku',
    name: 'Баку',
    country: 'Азербайджан',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    description: 'Побережье Каспия, современные башни и старинная архитектура.',
    placesToSee: ['Ичери-шехер', 'Пламенные башни', 'Приморский бульвар'],
  },
  {
    id: 'belgrade',
    name: 'Белград',
    country: 'Сербия',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    description: 'Выделяется берегами рек, крепостью и активной жизнью.',
    placesToSee: ['Калемегдан', 'Скадарлия', 'Улица князя Михаила'],
  }
];

// Modal Component - Şehir Detayları (Ücretsiz Şehirler İçin)
interface CityDetailModalProps {
  city: City;
  onClose: () => void;
}

const CityDetailModal = memo(function CityDetailModal({ city, onClose }: CityDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn will-change-opacity">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp will-change-transform">
        {/* Header Image */}
        <div className="relative h-80 overflow-hidden rounded-t-3xl">
          <img
            src={city.imageUrl}
            alt={city.name}
            className="w-full h-full object-cover"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = FALLBACK_CITY_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-all shadow-lg"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>

          {/* City Title Overlay */}
          <div className="absolute bottom-6 left-6">
            <h2 className="text-5xl font-extrabold text-white mb-2">{city.name}</h2>
            <p className="text-white/90 text-lg flex items-center gap-2">
              <MapPin size={20} />
              {city.country}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">История города</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{city.description}</p>
          </div>

          {/* Places to See */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Что посмотреть</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {city.placesToSee.map((place, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 font-medium">{place}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

interface CityCardProps {
  city: City;
  onSelect: (city: City) => void;
}

const CityCard = memo(function CityCard({ city, onSelect }: CityCardProps) {
  return (
    <div
      className="relative group rounded-[10px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(city)}
    >
      <div className="relative h-40 md:h-44 overflow-hidden">
        <img
          src={city.imageUrl}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = FALLBACK_CITY_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-[29px] leading-8 font-semibold text-white drop-shadow-sm truncate">
            {city.name}
          </h3>
        </div>
      </div>
    </div>
  );
});

// Ana Sayfa Componenti
const Destinations = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleCityClick = useCallback((city: City) => {
    setSelectedCity(city);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f8] font-sans">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-28 pb-14">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[40px] leading-tight md:text-[52px] font-semibold text-[#222a38] mb-4">
            Популярные направления
          </h1>
          <p className="text-[18px] leading-7 text-[#6b7280] max-w-4xl mx-auto font-normal">
            Выберите один из популярных городов для планирования поездки вашей мечты.
            Узнайте подробности о городе в один клик и начните планировать свое путешествие.
          </p>
        </div>

        {/* Kompakt Şehir Grid'i */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {cities.map((city) => (
            <CityCard key={city.id} city={city} onSelect={handleCityClick} />
          ))}
        </div>

      </div>

      {/* Modals */}
      {selectedCity && (
        <CityDetailModal
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
        />
      )}
      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Destinations;
