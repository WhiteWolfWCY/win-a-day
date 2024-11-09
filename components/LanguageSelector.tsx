"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', flag: '🇬🇧' },
    { code: 'pl', flag: '🇵🇱' }
  ];

  const handleLocaleChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  const getCurrentFlag = () => {
    return languages.find(lang => lang.code === locale)?.flag || '🌐';
  };

  return (
    <div className="fixed left-6 bottom-6 z-50">
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <>
              {languages
                .filter(lang => lang.code !== locale)
                .map((lang) => (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -52 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleLocaleChange(lang.code)}
                    className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-xl">{lang.flag}</span>
                  </motion.button>
                ))}
            </>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span className="text-xl">{getCurrentFlag()}</span>
        </motion.button>
      </div>
    </div>
  );
} 