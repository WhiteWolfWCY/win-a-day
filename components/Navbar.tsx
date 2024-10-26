"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { BarChart2, CalendarIcon, CheckCircle, Home, Users, Menu, X, Goal, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { href: "/dashboard/home", icon: Home, label: "Dashboard" },
        { href: "/dashboard/habits", icon: CheckCircle, label: "Habits" },
        { href: "/dashboard/goals", icon: Goal, label: "Goals" },
        { href: "/dashboard/community", icon: Users, label: "Community" },
        { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
    ];

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    return (
        <>
            <header className="w-full p-4 bg-white bg-opacity-80 backdrop-blur-sm shadow-sm relative z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <button
                        className="lg:hidden z-20"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link href="/" className="flex items-center space-x-3 lg:flex-1">
                        <CalendarIcon className="h-8 w-8 text-yellow-500" />
                        <span className="font-bold text-2xl">Win a Day</span>
                    </Link>
                    <nav className="hidden lg:flex space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-2 text-gray-600 hover:text-yellow-500",
                                    pathname === item.href && "text-yellow-500"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="lg:flex-1 flex justify-end items-center gap-4">
                        <Link href="/dashboard/settings">
                            <Settings className="h-6 w-6 text-gray-600 hover:text-yellow-500    " />
                        </Link>
                        <UserButton />
                    </div>
                </div>
            </header>
            <div className={cn(
                "fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out",
                mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )} onClick={() => setMobileMenuOpen(false)}>
                <div className={cn(
                    "fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-300 ease-in-out transform",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-2 text-gray-600 hover:text-yellow-500 p-2",
                                    pathname === item.href && "text-yellow-500"
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
