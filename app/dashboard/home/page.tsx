"use client";

import NewestHabits from "@/components/NewestHabits";
import OverviewSection from "@/components/OverviewSection";

export default function DashboardPage() {
  return (
    <main className="container mx-auto flex-grow flex flex-col gap-6 p-6 z-10">
      <OverviewSection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NewestHabits />
      </div>
    </main>
  );
}
