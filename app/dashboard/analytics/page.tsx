"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getHabitStreaks, getCategoryDistribution, getGoalCompletionRateOverTime, getHabitBalance } from "@/actions/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import Loader from "@/components/Loader";
import { format, parseISO } from "date-fns";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
];

const chartConfig: ChartConfig = {
  currentStreak: { label: "Current Streak", color: COLORS[0] },
  maxStreak: { label: "Max Streak", color: COLORS[1] },
  completionRate: { label: "Completion Rate", color: COLORS[2] },
  goodHabits: { label: "Good Habits", color: COLORS[3] },
  badHabits: { label: "Bad Habits", color: COLORS[4] },
};

const NoDataMessage = () => (
  <div className="text-center text-gray-500 py-8">
    No data available to show statistics.
  </div>
);

export default function AnalyticsPage() {
    const { userId } = useAuth();

    const { data: habitStreaks, isLoading: isLoadingStreaks } = useQuery({
        queryKey: ["habit-streaks", userId],
        queryFn: () => getHabitStreaks(userId!),
        enabled: !!userId,
    });

    const { data: categoryDistribution, isLoading: isLoadingCategoryDistribution } = useQuery({
        queryKey: ["category-distribution", userId],
        queryFn: () => getCategoryDistribution(userId!),
        enabled: !!userId,
    });

    const { data: goalCompletionRate, isLoading: isLoadingGoalCompletionRate } = useQuery({
        queryKey: ["goal-completion-rate", userId],
        queryFn: () => getGoalCompletionRateOverTime(userId!),
        enabled: !!userId,
    });

    const { data: habitBalance, isLoading: isLoadingHabitBalance } = useQuery({
        queryKey: ["habit-balance", userId],
        queryFn: () => getHabitBalance(userId!),
        enabled: !!userId,
    });

    if (isLoadingStreaks || isLoadingCategoryDistribution || isLoadingGoalCompletionRate || isLoadingHabitBalance) {
        return <Loader />;
    }

    if(habitStreaks && categoryDistribution && goalCompletionRate && habitBalance) {
        const hasData = habitStreaks?.length > 0 || 
                        categoryDistribution?.length > 0 || 
                        goalCompletionRate?.length > 0 || 
                        (habitBalance?.goodHabits > 0 || habitBalance?.badHabits > 0);

        if (!hasData) {
            return (
                <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                    <CardContent>
                        <NoDataMessage />
                    </CardContent>
                </Card>
            );
        }
    }

    return (
        <div className="space-y-6">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Habit Streaks</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart data={habitStreaks}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="habitName" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="currentStreak" fill="var(--color-currentStreak)" radius={4} />
                            <Bar dataKey="maxStreak" fill="var(--color-maxStreak)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Habit Distribution by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <Pie
                                data={categoryDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="habitCount"
                                nameKey="categoryName"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {categoryDistribution?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Goal Completion Rate Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <LineChart data={goalCompletionRate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(dateString) => format(parseISO(dateString), 'MMM dd')}
                            />
                            <YAxis />
                            <ChartTooltip 
                                content={<ChartTooltipContent 
                                    labelFormatter={(dateString) => format(parseISO(dateString as string), 'MMM dd, yyyy')}
                                />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line type="monotone" dataKey="completionRate" name="Completion Rate" />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Habit Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Habit Distribution</h3>
                            <ChartContainer config={chartConfig}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Good Habits", value: habitBalance?.goodHabits || 0 },
                                            { name: "Bad Habits", value: habitBalance?.badHabits || 0 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill={COLORS[3]} />
                                        <Cell fill={COLORS[4]} />
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                </PieChart>
                            </ChartContainer>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Habit Completion</h3>
                            <ChartContainer config={chartConfig}>
                                <BarChart
                                    data={[
                                        { name: "Good Habits", value: habitBalance?.goodHabitCompletionRate || 0 },
                                        { name: "Bad Habits", value: habitBalance?.badHabitCompletionRate || 0 },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar dataKey="value" name="Completion Rate" />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
