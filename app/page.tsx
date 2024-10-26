"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Award, Calendar, TrendingUp, Star, BarChart, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col relative overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-yellow-200 opacity-20"
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

      <header className="w-full p-6 bg-white bg-opacity-80 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-yellow-500" />
            <span className="font-bold text-2xl">Win a Day</span>
          </Link>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard/home">
              <Button size="sm" className="flex items-center justify-center hover:bg-yellow-600">
                Dive in
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
          <motion.h1
            className="text-5xl md:text-7xl font-bold leading-tight text-center mt-12 sm:mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Transform Your Habits,{" "}
            <span className="text-yellow-500">Win a Day</span> 🏆
          </motion.h1>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mt-12 md:mt-20">
            <div className="md:w-1/2 space-y-8">
              <motion.p
                className="text-xl md:text-2xl text-gray-600 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Track, improve, and celebrate your daily habits with our
                intuitive app. Turn your routines into victories!
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
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Link href="/dashboard/home">
                    Start Your Journey <ArrowRight className="h-8 w-8" />
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
                <div className="absolute z-20 -top-8 -left-8 bg-yellow-200 rounded-full p-4">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="absolute z-20 -bottom-8 -right-8 bg-yellow-200 rounded-full p-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="bg-white rounded-2xl shadow-2xl p-8 h-80 flex items-center justify-center relative overflow-hidden">
                  <span className="text-9xl">🎯</span>
                  <div className="absolute top-4 right-4 flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-6 w-6 text-yellow-400"
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
            Why Choose Win a Day?
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <CheckCircle className="h-12 w-12 text-primary mb-4" />
                <h1 className="text-2xl font-bold">Track Good Habits</h1>
                <p className="text-muted-foreground">Set and monitor positive habits to improve your daily routine.</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
              <XCircle className="h-12 w-12 text-primary mb-4" />
                <h1 className="text-2xl font-bold">Break Bad Habits</h1>
                <p className="text-muted-foreground">Identify and work on breaking negative habits holding you back.</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
              <BarChart className="h-12 w-12 text-primary mb-4" />
                <h1 className="text-2xl font-bold">Visualize Progress</h1>
                <p className="text-muted-foreground">See your improvement over time with intuitive charts and stats.</p>
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
        <ArrowRight className="h-12 w-12 text-yellow-500 animate-bounce" />
      </motion.div>
    </div>
  );
}
