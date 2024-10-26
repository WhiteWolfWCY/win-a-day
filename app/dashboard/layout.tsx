"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Navbar from "@/components/Navbar";
import QueryClientProvider from "@/components/QueryClientProvider";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <QueryClientProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col relative overflow-hidden z-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-yellow-200 opacity-20 z-0"
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
          <div className="z-20 relative">
            <Navbar />
          </div>
          <MaxWidthWrapper className="pt-8 z-10 relative">
            {children}
          </MaxWidthWrapper>
          <Toaster />
        </div>
      </QueryClientProvider>
    </>
  );
}
