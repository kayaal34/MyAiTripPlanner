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
    name: 'İstanbul',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    description: 'Tarihi yarımada ve Boğaz manzarasıyla eşsiz bir şehir.',
    placesToSee: ['Ayasofya', 'Topkapı Sarayı', 'Galata Kulesi'],
  },
  {
    id: 'antalya',
    name: 'Antalya',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1582634578140-83f53f3f9f8f?w=800&q=80',
    description: 'Akdeniz kıyıları ve sıcak iklimiyle popüler tatil rotası.',
    placesToSee: ['Kaleiçi', 'Düden Şelalesi', 'Konyaaltı Plajı'],
  },
  {
    id: 'izmir',
    name: 'İzmir',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    description: 'Ege esintisi, kordon ve keyifli şehir yaşamı.',
    placesToSee: ['Kordon', 'Saat Kulesi', 'Asansör'],
  },
  {
    id: 'mugla',
    name: 'Muğla',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    description: 'Fethiye, Bodrum ve Marmaris hattının gözde merkezi.',
    placesToSee: ['Akyaka', 'Ölüdeniz', 'Datça'],
  },
  {
    id: 'roma',
    name: 'Roma',
    country: 'İtalya',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    description: 'Antik kalıntılar ve meydanlarla dolu tarih başkenti.',
    placesToSee: ['Kolezyum', 'Trevi Çeşmesi', 'Pantheon'],
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'Fransa',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    description: 'Sanat, moda ve romantik sokaklarıyla ikonik şehir.',
    placesToSee: ['Eyfel Kulesi', 'Louvre', 'Montmartre'],
  },
  {
    id: 'saraybosna',
    name: 'Saraybosna',
    country: 'Bosna Hersek',
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
    description: 'Doğu ve batı kültürünün buluştuğu Balkan şehri.',
    placesToSee: ['Başçarşı', 'Latin Köprüsü', 'Sarı Tabya'],
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'BAE',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    description: 'Modern siluet ve lüks deneyimleriyle öne çıkan destinasyon.',
    placesToSee: ['Burj Khalifa', 'Dubai Marina', 'Palm Jumeirah'],
  },
  {
    id: 'trabzon',
    name: 'Trabzon',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80',
    description: 'Karadeniz yaylaları ve doğasıyla huzurlu kaçış noktası.',
    placesToSee: ['Sümela Manastırı', 'Uzungöl', 'Boztepe'],
  },
  {
    id: 'barselona',
    name: 'Barselona',
    country: 'İspanya',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    description: 'Gaudi eserleri ve sahil hattıyla canlı Akdeniz şehri.',
    placesToSee: ['Sagrada Familia', 'Park Güell', 'La Rambla'],
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Hollanda',
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
    description: 'Kanallar, bisiklet kültürü ve sanatla dolu şehir.',
    placesToSee: ['Dam Meydanı', 'Van Gogh Müzesi', 'Rijksmuseum'],
  },
  {
    id: 'tiflis',
    name: 'Tiflis',
    country: 'Gürcistan',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    description: 'Tarihi sokakları ve termal hamamlarıyla özgün rota.',
    placesToSee: ['Narikala', 'Old Tbilisi', 'Rustaveli'],
  },
  {
    id: 'moskova',
    name: 'Moskova',
    country: 'Rusya',
    imageUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80',
    description: 'Kızıl Meydan ve ikonik mimariyle güçlü bir metropol.',
    placesToSee: ['Kızıl Meydan', 'Kremlin', 'Arbat'],
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Almanya',
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
    description: 'Tarih, gece hayatı ve yaratıcı kültürün merkezi.',
    placesToSee: ['Brandenburg Kapısı', 'Berlin Duvarı', 'Museum Island'],
  },
  {
    id: 'atina',
    name: 'Atina',
    country: 'Yunanistan',
    imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
    description: 'Antik kalıntılarla modern şehir hayatını birleştirir.',
    placesToSee: ['Akropolis', 'Plaka', 'Syntagma'],
  },
  {
    id: 'sanliurfa',
    name: 'Şanlıurfa',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
    description: 'Göbeklitepe ve tarihi atmosferiyle kültür rotası.',
    placesToSee: ['Balıklıgöl', 'Göbeklitepe', 'Urfa Kalesi'],
  },
  {
    id: 'gaziantep',
    name: 'Gaziantep',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&q=80',
    description: 'Lezzet durakları ve zengin mutfak kültürüyle ünlü.',
    placesToSee: ['Zeugma Müzesi', 'Bakırcılar Çarşısı', 'Kale'],
  },
  {
    id: 'venedik',
    name: 'Venedik',
    country: 'İtalya',
    imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    description: 'Kanalları ve gondol turlarıyla romantik şehir deneyimi.',
    placesToSee: ['San Marco', 'Rialto', 'Grand Canal'],
  },
  {
    id: 'londra',
    name: 'Londra',
    country: 'İngiltere',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    description: 'Kültür, müze ve klasik şehir siluetiyle dünya metropolü.',
    placesToSee: ['Big Ben', 'London Eye', 'Tower Bridge'],
  },
  {
    id: 'bodrum',
    name: 'Bodrum',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80',
    description: 'Beyaz evleri, marinası ve canlı gece hayatıyla popüler.',
    placesToSee: ['Bodrum Kalesi', 'Marina', 'Yalıkavak'],
  },
  {
    id: 'mardin',
    name: 'Mardin',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1518991791750-749b7d5ef71d?w=800&q=80',
    description: 'Taş mimarisi ve Mezopotamya manzarasıyla eşsiz şehir.',
    placesToSee: ['Eski Mardin', 'Deyrulzafaran', 'Zinciriye'],
  },
  {
    id: 'lizbon',
    name: 'Lizbon',
    country: 'Portekiz',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    description: 'Renkli tramvayları ve tepe manzaralarıyla keyifli rota.',
    placesToSee: ['Alfama', 'Belem', 'Rossio'],
  },
  {
    id: 'uskup',
    name: 'Üsküp',
    country: 'Kuzey Makedonya',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    description: 'Taş Köprü ve çarşı kültürüyle Balkanların dikkat çeken şehri.',
    placesToSee: ['Taş Köprü', 'Eski Çarşı', 'Vodna'],
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'ABD',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    description: 'Hiç uyumayan şehirde kültür, sanat ve enerji bir arada.',
    placesToSee: ['Times Square', 'Central Park', 'Brooklyn Bridge'],
  },
  {
    id: 'ankara',
    name: 'Ankara',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    description: 'Başkent atmosferi, müzeler ve düzenli şehir yaşamı.',
    placesToSee: ['Anıtkabir', 'Hamamönü', 'Anadolu Medeniyetleri Müzesi'],
  },
  {
    id: 'bursa',
    name: 'Bursa',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
    description: 'Uludağ, tarihi hanlar ve güçlü mutfak kültürüyle öne çıkar.',
    placesToSee: ['Uludağ', 'Cumalıkızık', 'Koza Han'],
  },
  {
    id: 'adana',
    name: 'Adana',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80',
    description: 'Lezzet durakları ve nehir kıyısıyla sıcak bir şehir deneyimi.',
    placesToSee: ['Taş Köprü', 'Sabancı Merkez Camii', 'Seyhan'],
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'İspanya',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
    description: 'Meydanları, müzeleri ve canlı gece hayatıyla güçlü başkent.',
    placesToSee: ['Puerta del Sol', 'Prado Müzesi', 'Retiro Parkı'],
  },
  {
    id: 'vienna',
    name: 'Viyana',
    country: 'Avusturya',
    imageUrl: 'https://images.unsplash.com/photo-1516550893885-98568267b71c?w=800&q=80',
    description: 'Klasik müzik, saraylar ve zarif şehir dokusuyla ünlüdür.',
    placesToSee: ['Schönbrunn', 'Stephansdom', 'Belvedere'],
  },
  {
    id: 'budapest',
    name: 'Budapeşte',
    country: 'Macaristan',
    imageUrl: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?w=800&q=80',
    description: 'Tuna kıyısı, tarihi hamamlar ve köprüleriyle etkileyici şehir.',
    placesToSee: ['Parlamento Binası', 'Zincir Köprü', 'Buda Kalesi'],
  },
  {
    id: 'prag',
    name: 'Prag',
    country: 'Çekya',
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
    description: 'Masalsı sokakları ve köprüleriyle Avrupa klasiği.',
    placesToSee: ['Charles Köprüsü', 'Eski Şehir Meydanı', 'Prag Kalesi'],
  },
  {
    id: 'seoul',
    name: 'Seul',
    country: 'Güney Kore',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7c897b1f1d9b?w=800&q=80',
    description: 'Teknoloji, gelenek ve hızlı şehir yaşamını bir arada sunar.',
    placesToSee: ['Gyeongbokgung', 'Myeongdong', 'N Seoul Tower'],
  },
  {
    id: 'singapore',
    name: 'Singapur',
    country: 'Singapur',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    description: 'Temiz şehir düzeni ve modern mimarisiyle dikkat çeker.',
    placesToSee: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa'],
  },
  {
    id: 'baku',
    name: 'Bakü',
    country: 'Azerbaycan',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    description: 'Hazar kıyısı, modern kuleler ve eski şehir dokusu bir arada.',
    placesToSee: ['İçerişehir', 'Alev Kuleleri', 'Bulvar'],
  },
  {
    id: 'belgrade',
    name: 'Belgrad',
    country: 'Sırbistan',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    description: 'Nehir kıyısı, tarihi kale ve canlı sosyal hayatıyla öne çıkar.',
    placesToSee: ['Kalemegdan', 'Skadarlija', 'Knez Mihailova'],
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Şehir Hikayesi</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{city.description}</p>
          </div>

          {/* Places to See */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Görülmesi Gereken Yerler</h3>
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
            Tatil Şehirleri
          </h1>
          <p className="text-[18px] leading-7 text-[#6b7280] max-w-4xl mx-auto font-normal">
            Hayalinizdeki geziyi planlamak için populer şehirlerden birini seçin.
            Tek tıkla şehir detaylarını inceleyip gezinizi planlamaya başlayın.
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
