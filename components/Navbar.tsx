"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { BarChart2, CalendarIcon, CheckCircle, Home, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {

    const pathname = usePathname();

    return (
        <header className="w-full p-4 bg-white bg-opacity-80 backdrop-blur-sm shadow-sm z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-yellow-500" />
            <span className="font-bold text-2xl">Win a Day</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard/home" className={cn("flex items-center space-x-2 text-gray-600 hover:text-yellow-500", pathname === "/dashboard/home" && "text-yellow-500")}>
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/habits" className={cn("flex items-center space-x-2 text-gray-600 hover:text-yellow-500", pathname === "/dashboard/habits" && "text-yellow-500")}>
              <CheckCircle className="h-5 w-5" />
              <span>Habits</span>
            </Link>
            <Link href="/dashboard/community" className={cn("flex items-center space-x-2 text-gray-600 hover:text-yellow-500", pathname === "/dashboard/community" && "text-yellow-500")}>
              <Users className="h-5 w-5" />
              <span>Community</span>
            </Link>
            <Link href="/dashboard/analytics" className={cn("flex items-center space-x-2 text-gray-600 hover:text-yellow-500", pathname === "/dashboard/analytics" && "text-yellow-500")}   >
              <BarChart2 className="h-5 w-5" />
              <span>Analytics</span>
            </Link>
          </nav>
          <UserButton />
        </div>
      </header>
    )
}