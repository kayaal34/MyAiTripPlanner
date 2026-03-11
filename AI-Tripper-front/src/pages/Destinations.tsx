import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Lock, X, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

// Mock Data - 12 Şehir (5 Ücretsiz + 7 Premium)
interface City {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  placesToSee: string[];
  isPremium: boolean;
}

const cities: City[] = [
  // Ücretsiz Şehirler (isPremium: false)
  {
    id: 'paris',
    name: 'Paris',
    country: 'Fransa',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    description: 'Aşk şehri Paris, Eyfel Kulesi ve Louvre ile dünyanın en romantik destinasyonu.',
    placesToSee: ['Eyfel Kulesi', 'Louvre Müzesi', 'Notre-Dame Katedrali', 'Champs-Élysées', 'Sacré-Cœur'],
    isPremium: false
  },
  {
    id: 'rome',
    name: 'Roma',
    country: 'İtalya',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    description: 'Antik Roma\'nın kalbi, Kolezyum ve tarihi kalıntılarıyla büyüleyici bir şehir.',
    placesToSee: ['Kolezyum', 'Vatikan Müzeleri', 'Trevi Çeşmesi', 'Pantheon', 'İspanyol Merdivenleri'],
    isPremium: false
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japonya',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    description: 'Gelenek ve modernliğin buluştuğu şehir, neon ışıkları ve tapınakları ile büyüleyici.',
    placesToSee: ['Tokyo Tower', 'Senso-ji Tapınağı', 'Shibuya Geçidi', 'Meiji Tapınağı', 'Akihabara'],
    isPremium: false
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'ABD',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    description: 'Hiç uyumayan şehir, Times Square ve Central Park ile dünyanın kültür merkezi.',
    placesToSee: ['Özgürlük Heykeli', 'Times Square', 'Central Park', 'Brooklyn Köprüsü', 'Empire State'],
    isPremium: false
  },
  {
    id: 'istanbul',
    name: 'İstanbul',
    country: 'Türkiye',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    description: 'İki kıtanın buluştuğu eşsiz şehir, tarihi ve kültürüyle büyüleyici.',
    placesToSee: ['Ayasofya', 'Sultanahmet Camii', 'Topkapı Sarayı', 'Kapalıçarşı', 'Galata Kulesi'],
    isPremium: false
  },
  
  // Premium Şehirler (isPremium: true)
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'İspanya',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    description: 'Gaudi\'nin şaheserleri ve plajlarıyla Akdeniz\'in incisi.',
    placesToSee: ['Sagrada Familia', 'Park Güell', 'La Rambla', 'Casa Batlló', 'Camp Nou'],
    isPremium: true
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'BAE',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    description: 'Çöldeki mucize şehir, gökdelenler ve lüks alışverişin başkenti.',
    placesToSee: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Marina', 'Gold Souk'],
    isPremium: true
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Endonezya',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    description: 'Tapınaklar adası, tropikal cennet ve yoga başkenti.',
    placesToSee: ['Tanah Lot Tapınağı', 'Ubud Pirinç Tarlaları', 'Tegenungan Şelalesi', 'Seminyak Plajı'],
    isPremium: true
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Yunanistan',
    imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80',
    description: 'Beyaz evler ve mavi kubbeler, Ege\'nin cennet köşesi.',
    placesToSee: ['Oia Gün Batımı', 'Fira Kasabası', 'Kırmızı Plaj', 'Akrotiri Antik Kenti'],
    isPremium: true
  },
  {
    id: 'prague',
    name: 'Prag',
    country: 'Çek Cumhuriyeti',
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
    description: 'Orta Çağ\'dan kalma şato ve köprülerle masalsı bir şehir.',
    placesToSee: ['Prag Şatosu', 'Charles Köprüsü', 'Eski Kent Meydanı', 'Astronomik Saat'],
    isPremium: true
  },
  {
    id: 'venice',
    name: 'Venedik',
    country: 'İtalya',
    imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    description: 'Kanallar şehri, gondollar ve San Marco Meydanı ile romantik bir kaçış.',
    placesToSee: ['San Marco Meydanı', 'Rialto Köprüsü', 'Canal Grande', 'Doge Sarayı'],
    isPremium: true
  },
  {
    id: 'maldives',
    name: 'Maldivler',
    country: 'Maldivler',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    description: 'Tropikal cennet adaları, turkuaz sular ve lüks villaların adresi.',
    placesToSee: ['Maafushi Adası', 'Mercan Resifleri', 'Bioluminescent Plaj', 'Male Şehri'],
    isPremium: true
  }
];

// Modal Component - Şehir Detayları (Ücretsiz Şehirler İçin)
interface CityDetailModalProps {
  city: City;
  onClose: () => void;
}

const CityDetailModal: React.FC<CityDetailModalProps> = ({ city, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        {/* Header Image */}
        <div className="relative h-80 overflow-hidden rounded-t-3xl">
          <img
            src={city.imageUrl}
            alt={city.name}
            className="w-full h-full object-cover"
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
};

// Modal Component - Premium Uyarısı (Kilitli Şehirler İçin)
interface PremiumUpsellModalProps {
  onClose: () => void;
}

const PremiumUpsellModal: React.FC<PremiumUpsellModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-slideUp relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-all shadow-md"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>

        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-full shadow-xl">
            <Lock className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
            Premium İçerik Kilitli 🔒
          </h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Tüm dünyayı keşfetmek için <span className="font-bold text-purple-700">Premium plan</span> kilidini açın.
            <br />
            50+ özel rota, yerel ipuçları ve sınırsız seyahat planı sizi bekliyor!
          </p>

          {/* Features */}
          <div className="bg-white/80 rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-800">50+ Premium Şehir</p>
                <p className="text-sm text-gray-600">Dünyanın gizli köşelerini keşfedin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-8 h-8 text-pink-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-800">Yerel Rehber İpuçları</p>
                <p className="text-sm text-gray-600">Turistik olmayan yerler ve sırlar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                ∞
              </div>
              <div>
                <p className="font-bold text-gray-800">Sınırsız Seyahat Planı</p>
                <p className="text-sm text-gray-600">Dilediğiniz kadar plan oluşturun</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              onClose();
              navigate('/pricing');
            }}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-2xl text-xl font-bold hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-purple-500/50"
          >
            Premium Al 🚀
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Şimdi abone olun, dilediğiniz zaman iptal edin
          </p>
        </div>
      </div>
    </div>
  );
};

// Ana Sayfa Componenti
const Destinations = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleCityClick = (city: City) => {
    if (city.isPremium) {
      setShowPremiumModal(true);
    } else {
      setSelectedCity(city);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            Tatil Şehirleri 🌍
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Dünyanın en güzel şehirlerini keşfedin. 
            <span className="font-semibold text-purple-700"> Premium ile tüm dünya sizin!</span>
          </p>
        </div>

        {/* Kompakt Grid - 7 Sütun */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {cities.map((city) => (
            <div
              key={city.id}
              className="relative group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleCityClick(city)}
            >
              {/* City Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* City Name on Image */}
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-xl font-bold text-white truncate">{city.name}</h3>
                  <p className="text-white/80 text-xs truncate">{city.country}</p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3">
                <p className="text-gray-700 text-sm line-clamp-2 mb-3 min-h-[40px]">
                  {city.description}
                </p>
                
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                  Şehri Keşfet
                </button>
              </div>

              {/* Premium Lock Overlay */}
              {city.isPremium && (
                <div className="absolute inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center">
                  <div className="bg-white/90 p-4 rounded-full shadow-2xl">
                    <Lock className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
              )}
            </div>
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

      {showPremiumModal && (
        <PremiumUpsellModal
          onClose={() => setShowPremiumModal(false)}
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
