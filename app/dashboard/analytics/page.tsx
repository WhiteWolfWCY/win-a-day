/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  getHabitStreaks,
  getCategoryDistribution,
  getGoalCompletionRateOverTime,
  getHabitBalance,
  CategoryDistribution,
} from "@/actions/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Loader from "@/components/Loader";

const COLORS = ["#fbbf24", "#fcd34d", "#fde68a", "#fef3c7", "#fffbeb"];

export default function AnalyticsPage() {
  const { userId } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: habitStreaks, isLoading: isLoadingStreaks } = useQuery({
    queryKey: ["habit-streaks", userId, dateRange.from, dateRange.to],
    queryFn: () => getHabitStreaks(userId!, dateRange.from, dateRange.to),
    enabled: !!userId,
  });

  const {
    data: categoryDistribution,
    isLoading: isLoadingCategoryDistribution,
  } = useQuery<CategoryDistribution[]>({
    queryKey: ["category-distribution", userId],
    queryFn: () => getCategoryDistribution(userId!),
    enabled: !!userId,
  });

  const { data: goalCompletionRate, isLoading: isLoadingGoalCompletionRate } =
    useQuery({
      queryKey: ["goal-completion-rate", userId, dateRange.from, dateRange.to],
      queryFn: () => getGoalCompletionRateOverTime(userId!, dateRange.from, dateRange.to),
      enabled: !!userId,
    });

  const { data: habitBalance, isLoading: isLoadingHabitBalance } = useQuery({
    queryKey: ["habit-balance", userId, dateRange.from, dateRange.to],
    queryFn: () => getHabitBalance(userId!, dateRange.from, dateRange.to),
    enabled: !!userId,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Your Analytics</h1>

      {/* Date range picker */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-2">
              <Label htmlFor="from">From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="from"
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${
                      !dateRange.from && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      format(dateRange.from, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: date || prev.from,
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to">To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="to"
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${
                      !dateRange.to && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? (
                      format(dateRange.to, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) =>
                      setDateRange((prev) => ({ ...prev, to: date || prev.to }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingStreaks ||
      isLoadingCategoryDistribution ||
      isLoadingGoalCompletionRate ||
      isLoadingHabitBalance ? (
        <Loader />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <OverviewCard
              title="Total Habits"
              value={
                habitBalance
                  ? (
                      habitBalance.goodHabits + habitBalance.badHabits
                    ).toString()
                  : "-"
              }
              trend="up"
              percentage={
                habitBalance
                  ? `${(
                      (habitBalance.goodHabits /
                        (habitBalance.goodHabits + habitBalance.badHabits)) *
                      100
                    ).toFixed(0)}% Good`
                  : "-"
              }
            />
            <OverviewCard
              title="Good Habit Completion"
              value={
                habitBalance
                  ? `${habitBalance.goodHabitCompletionRate.toFixed(0)}%`
                  : "-"
              }
              trend={
                habitBalance && habitBalance.goodHabitCompletionRate > 50
                  ? "up"
                  : "down"
              }
              percentage={`${
                habitBalance ? habitBalance.goodHabits : "-"
              } Habits`}
            />
            <OverviewCard
              title="Bad Habit Avoidance"
              value={
                habitBalance
                  ? `${(100 - habitBalance.badHabitCompletionRate).toFixed(0)}%`
                  : "-"
              }
              trend={
                habitBalance && habitBalance.badHabitCompletionRate < 50
                  ? "up"
                  : "down"
              }
              percentage={`${
                habitBalance ? habitBalance.badHabits : "-"
              } Habits`}
            />
            <OverviewCard
              title="Categories"
              value={
                categoryDistribution
                  ? categoryDistribution.length.toString()
                  : "-"
              }
              trend="up"
              percentage={
                categoryDistribution
                  ? `${categoryDistribution.reduce(
                      (sum, cat) => sum + cat.habitCount,
                      0
                    )} Habits`
                  : "-"
              }
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <HabitStreaksChart data={habitStreaks || []} />
            <GoalCompletionRateChart data={goalCompletionRate || []} />
            <HabitCategoryChart data={categoryDistribution || []} />
            <HabitBalanceChart data={habitBalance} />
          </div>
        </>
      )}
    </div>
  );
}

function OverviewCard({
  title,
  value,
  trend,
  percentage,
}: {
  title: string;
  value: string;
  trend: "up" | "down";
  percentage: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend === "up" ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${
            trend === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {percentage !== "N/A"
            ? `${trend === "up" ? "+" : "-"}${percentage} completion`
            : "N/A"}
        </p>
      </CardContent>
    </Card>
  );
}

function HabitStreaksChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Streaks</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="habitName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="currentStreak" fill="#fbbf24" name="Current Streak" />
            <Bar dataKey="maxStreak" fill="#fcd34d" name="Max Streak" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function GoalCompletionRateChart({ data }: { data: any[] }) {
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Completion Rate Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={sortedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "MMM dd")}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              labelFormatter={(date) => format(new Date(date as string), "MMM dd, yyyy")}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "Completion Rate"]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#fbbf24"
              activeDot={{ r: 8 }}
              name="Completion Rate"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HabitCategoryChart({ data }: { data: CategoryDistribution[] }) {
  const totalHabits = data.reduce(
    (sum, category) => sum + category.habitCount,
    0
  );

  // Ensure data is properly formatted for the chart
  const chartData = data.map((category) => ({
    name: category.categoryName,
    value: category.habitCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} habits (${(
                  (Number(value) / totalHabits) *
                  100
                ).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-gray-500">
          Total Habits: {totalHabits}
        </div>
      </CardContent>
    </Card>
  );
}

function HabitBalanceChart({ data }: { data: any }) {
  const chartData = data
    ? [
        { name: "Good Habits", value: data.goodHabits },
        { name: "Bad Habits", value: data.badHabits },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              <Cell fill="#fbbf24" />
              <Cell fill="#fcd34d" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
