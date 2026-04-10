import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Compass, Map, Sparkles } from 'lucide-react';

type LoadingModalProps = {
  isOpen: boolean;
  currentMessage: string;
};

export default function LoadingModal({ isOpen, currentMessage }: LoadingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const start = Date.now();
    const maxProgress = 94;
    const duration = 15000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const nextProgress = Math.min((elapsed / duration) * maxProgress, maxProgress);
      setProgress(nextProgress);
    }, 120);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            className="w-full max-w-xl mx-4 rounded-3xl bg-white/95 p-8 md:p-10 shadow-[0_20px_80px_rgba(15,23,42,0.18)] border border-white"
          >
            <div className="flex items-center justify-center mb-7">
              <motion.div
                animate={{
                  scale: [1, 1.07, 1],
                  boxShadow: [
                    '0 8px 20px rgba(249,115,22,0.22)',
                    '0 12px 30px rgba(245,158,11,0.28)',
                    '0 8px 20px rgba(249,115,22,0.22)'
                  ]
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-3xl border border-white/30"
                />
                <Sparkles className="h-9 w-9 text-white" />
                <Map className="absolute -left-2 -bottom-2 h-5 w-5 text-orange-800/60" />
                <Compass className="absolute -right-2 -top-2 h-5 w-5 text-orange-100" />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-center mb-7 min-h-[58px]"
              >
                <p className="text-base md:text-lg font-semibold text-slate-800">
                  {currentMessage}
                </p>
                <p className="mt-1 text-sm text-slate-500">ИИ-ассистент составляет идеальный маршрут</p>
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
              <div className="rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold text-slate-500">ИИ-Алгоритм</p>
                <p className="text-sm font-bold text-slate-800">Анализ</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold text-slate-500">Геоданные</p>
                <p className="text-sm font-bold text-slate-800">Синхронизация</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold text-slate-500">Маршрут</p>
                <p className="text-sm font-bold text-slate-800">Оптимизация</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>Создание вашего плана</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
