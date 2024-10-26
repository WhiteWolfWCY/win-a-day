"use client";

import NewestHabits from "@/components/NewestHabits";
import RecentGoals from "@/components/RecentGoals";
import OverviewSection from "@/components/OverviewSection";
import GoalsForDays from "@/components/GoalsForDays";

export default function DashboardPage() {
  return (
    <main className="container mx-auto flex-grow flex flex-col gap-6 p-6 z-10">
      <OverviewSection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NewestHabits />
        <RecentGoals />
      </div>
      <GoalsForDays />
    </main>
  );
}
