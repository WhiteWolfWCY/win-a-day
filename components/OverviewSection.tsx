"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getOverallGoalCompletion, getHabitAdherenceLastTwoWeeks } from "@/actions/actions";
import Loader from "./Loader";
import { format, parseISO, subDays } from "date-fns";

const COLORS = ["#54d282", "#eab308"]; 
const HABIT_COLORS = {
  good: "#54d282", 
  bad: "#eab308"   
};

export default function OverviewSection() {
  const { userId } = useAuth();

  const { data: goalCompletion, isLoading: isLoadingGoalCompletion } = useQuery({
    queryKey: ["goal-completion", userId],
    queryFn: () => getOverallGoalCompletion(userId!),
    enabled: !!userId,
  });

  const { data: habitAdherence, isLoading: isLoadingHabitAdherence } = useQuery({
    queryKey: ["habit-adherence", userId],
    queryFn: () => getHabitAdherenceLastTwoWeeks(userId!),
    enabled: !!userId,
  });

  if (isLoadingGoalCompletion || isLoadingHabitAdherence) {
    return <Loader />;
  }

  const goalCompletionData = [
    { name: "Completed", value: goalCompletion?.completed || 0 },
    { name: "Remaining", value: goalCompletion?.remaining || 0 },
  ];

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const sortedHabitAdherence = last14Days.map(date => {
    const dayData = habitAdherence?.find(d => d.date === date) || { date, goodHabits: 0, badHabits: 0 };
    return dayData;
  });

  return (
    <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Goal Completion</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={goalCompletionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {goalCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Habit Adherence (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sortedHabitAdherence} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(parseISO(date), 'dd.MM')}
                  ticks={last14Days.filter((_, i) => i % 2 === 0)}
                  axisLine={{ strokeWidth: 2 }}
                  tickLine={{ strokeWidth: 2 }}
                  tick={{ dx: -10 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(parseISO(date), 'dd-MM-yyyy')}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                <Line 
                  type="monotone" 
                  dataKey="goodHabits" 
                  stroke={HABIT_COLORS.good} 
                  name="Good" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="badHabits" 
                  stroke={HABIT_COLORS.bad} 
                  name="Bad" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
