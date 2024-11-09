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
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";

const COLORS = ["#54d282", "#eab308"]; 
const HABIT_COLORS = {
  good: "#54d282", 
  bad: "#eab308"   
};

// Custom tooltip component for the pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2 text-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`} {payload[0].payload.tooltipSuffix}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip component for the line chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2">
        <p className="font-medium mb-1">{format(parseISO(label), 'PPP')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${Number(entry.value).toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function OverviewSection() {
  const { userId } = useAuth();
  const t = useTranslations('dashboard.overview');

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
    { 
      name: t('charts.goalCompletion.completed'), 
      value: goalCompletion?.completed || 0,
      tooltipSuffix: t('charts.goalCompletion.goals')
    },
    { 
      name: t('charts.goalCompletion.remaining'), 
      value: goalCompletion?.remaining || 0,
      tooltipSuffix: t('charts.goalCompletion.goals')
    },
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
    <Card className="bg-opacity-80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('charts.goalCompletion.title')}</h3>
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
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('charts.habitAdherence.title')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sortedHabitAdherence} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(parseISO(date), t('charts.dateFormat'))}
                  ticks={last14Days.filter((_, i) => i % 2 === 0)}
                  axisLine={{ strokeWidth: 2 }}
                  tickLine={{ strokeWidth: 2 }}
                  tick={{ dx: -10 }}
                  className="text-foreground"
                />
                <YAxis className="text-foreground" />
                <Tooltip 
                  content={<CustomLineTooltip />}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="goodHabits" 
                  stroke={HABIT_COLORS.good} 
                  name={t('charts.habitAdherence.goodHabits')}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="badHabits" 
                  stroke={HABIT_COLORS.bad} 
                  name={t('charts.habitAdherence.badHabits')}
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
