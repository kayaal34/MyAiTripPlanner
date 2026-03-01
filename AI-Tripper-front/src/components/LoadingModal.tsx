import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const loadingMessages = [
  { emoji: '🔍', text: 'En iyi rotalar araştırılıyor...' },
  { emoji: '🌍', text: 'Harita verileri işleniyor...' },
  { emoji: '🤖', text: 'Yapay zeka planınızı oluşturuyor...' },
  { emoji: '🍽️', text: 'Lezzetli restoranlar seçiliyor...' },
  { emoji: '🗺️', text: 'Günlük program hazırlanıyor...' },
  { emoji: '✨', text: 'Son rötuşlar yapılıyor...' }
];

type LoadingModalProps = {
  isOpen: boolean;
};

export default function LoadingModal({ isOpen }: LoadingModalProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000); // Her 3 saniyede mesaj değiştir

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4"
          >
            {/* Spinner */}
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full"
              />
            </div>

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-8"
              >
                <div className="text-6xl mb-4">
                  {loadingMessages[currentMessageIndex].emoji}
                </div>
                <p className="text-white text-xl font-semibold">
                  {loadingMessages[currentMessageIndex].text}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Info Cards */}
            <div className="space-y-3">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3"
              >
                <div className="text-2xl">🧠</div>
                <div className="text-white text-sm">
                  <div className="font-semibold">Yapay Zeka</div>
                  <div className="text-white/70">Size özel plan oluşturuyor</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3"
              >
                <div className="text-2xl">🎯</div>
                <div className="text-white text-sm">
                  <div className="font-semibold">Kişiselleştirilmiş</div>
                  <div className="text-white/70">İlgi alanlarınıza göre</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3"
              >
                <div className="text-2xl">💰</div>
                <div className="text-white text-sm">
                  <div className="font-semibold">Bütçe Dostu</div>
                  <div className="text-white/70">Gerçekçi fiyat tahminleri</div>
                </div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="mt-8 bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 15, ease: 'linear' }}
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
