"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Award, Calendar, TrendingUp, Star, BarChart, CheckCircle, XCircle } from "lucide-react";
import Link from 'next/link';
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslations, useLocale } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background/85 flex flex-col relative overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 100 - 50],
            x: [0, Math.random() * 100 - 50],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}

      <header className="w-full p-6 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">Win a Day</span>
          </Link>
          <div className="flex items-center justify-center gap-4">
            <Link href={`/${locale}/dashboard/home`}>
              <Button size="sm" className="flex items-center justify-center">
                {t('common.diveIn')}
                <ArrowRight className="h-10 w-10" />
              </Button>
            </Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-grow flex flex-col justify-center px-6">
        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center">
            <motion.h1
              className="text-5xl md:text-6xl font-bold leading-tight text-center mt-12 sm:mt-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t('landing.title')}
            </motion.h1>
              <motion.span
                className="text-5xl bg-primary rounded-xl p-4 md:text-6xl font-bold leading-tight text-center mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Win a Day 🏆
              </motion.span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mt-12 md:mt-20">
            <div className="md:w-1/2 space-y-8">
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground dark:text-white/80 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {t('landing.subtitle')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex justify-center"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link href={`/${locale}/dashboard/home`}>
                    {t('landing.startJourney')} <ArrowRight className="h-8 w-8" />
                  </Link>
                </Button>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-3/4 md:w-1/2"
            >
              <div className="relative mt-12 md:mt-0">
                <div className="absolute z-20 -top-8 -left-8 bg-primary/20 rounded-full p-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute z-20 -bottom-8 -right-8 bg-primary/20 rounded-full p-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="bg-card rounded-2xl shadow-2xl p-8 h-80 flex items-center justify-center relative overflow-hidden">
                  <span className="text-9xl">🎯</span>
                  <div className="absolute top-4 right-4 flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-6 w-6 text-primary"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div
          className="w-full p-12 mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            {t('landing.whyChoose')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <CheckCircle className="h-12 w-12 text-primary mb-4" />
                <h1 className="text-2xl font-bold">{t('landing.features.trackGoodHabits.title')}</h1>
                <p className="text-muted-foreground">{t('landing.features.trackGoodHabits.description')}</p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <XCircle className="h-12 w-12 text-primary mb-4" />
                <h1 className="text-2xl font-bold">{t('landing.features.breakBadHabits.title')}</h1>
                <p className="text-muted-foreground">{t('landing.features.breakBadHabits.description')}</p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <BarChart className="h-12 w-12 text-primary mb-4" />
                <h1 className="text-2xl font-bold">{t('landing.features.visualizeProgress.title')}</h1>
                <p className="text-muted-foreground">{t('landing.features.visualizeProgress.description')}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden 2xl:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <ArrowRight className="h-12 w-12 text-primary animate-bounce" />
      </motion.div>
    </div>
  );
}
