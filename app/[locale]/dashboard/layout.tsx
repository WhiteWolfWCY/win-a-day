"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Navbar from "@/components/Navbar";
import QueryClientProvider from "@/components/QueryClientProvider";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { AIAssistant } from "@/components/AIAssistant";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (isLoaded && !userId) {
      const locale = params.locale || 'en';
      router.push(`/${locale}/sign-in`);
    }
  }, [isLoaded, userId, router, params.locale]);

  if (!isLoaded || !userId) {
    return null;
  }

  const floatingElements = Array.from({ length: 20 }, (_, i) => ({
    width: 50 + (((i * 7) % 11) * 10),
    height: 50 + (((i * 11) % 7) * 10),
    top: `${(i * 5) % 100}%`,
    left: `${(i * 7) % 100}%`,
    yOffset: ((i * 13) % 10) * 10 - 50,
    xOffset: ((i * 17) % 10) * 10 - 50,
    duration: 10 + ((i * 3) % 10),
  }));

  return (
    <QueryClientProvider>
      <div className="min-h-screen bg-gradient-custom flex flex-col relative overflow-hidden z-0">
        {floatingElements.map((elem, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full floating-element"
            style={{
              width: elem.width,
              height: elem.height,
              top: elem.top,
              left: elem.left,
            }}
            animate={{
              y: [0, elem.yOffset],
              x: [0, elem.xOffset],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: elem.duration,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
        <div className="z-20 relative">
          <Navbar />
        </div>
        <MaxWidthWrapper className="pt-8 z-10 relative">
          {children}
        </MaxWidthWrapper>
        <Toaster />
        <AIAssistant />
      </div>
    </QueryClientProvider>
  );
}
