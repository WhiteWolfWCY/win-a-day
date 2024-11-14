/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
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
import { CalendarIcon, ArrowUpRight, ArrowDownRight, FileArchive, FileJson } from "lucide-react";
import Loader from "@/components/Loader";
import { useTranslations } from 'next-intl';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';

const COLORS = ["#fbbf24", "#fcd34d", "#fde68a", "#fef3c7", "#fffbeb"];

export default function AnalyticsPage() {
  const { userId } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const t = useTranslations();

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

  // Add refs for chart containers
  const streaksChartRef = useRef<HTMLDivElement>(null);
  const completionChartRef = useRef<HTMLDivElement>(null);
  const categoryChartRef = useRef<HTMLDivElement>(null);
  const balanceChartRef = useRef<HTMLDivElement>(null);

  const handleDownloadReport = async () => {
    const workbook = new ExcelJS.Workbook();
    
    const captureChart = async (ref: HTMLDivElement | null) => {
      if (ref) {
        try {
          return await htmlToImage.toPng(ref);
        } catch (error) {
          console.error('Error capturing chart:', error);
          return null;
        }
      }
      return null;
    };

    // Habit Streaks
    if (habitStreaks) {
      const ws = workbook.addWorksheet('Habit Streaks');
      ws.columns = Object.keys(habitStreaks[0]).map(key => ({ 
        header: key, 
        key,
        width: 15 
      }));
      ws.addRows(habitStreaks);

      // Add some spacing after data
      ws.addRow([]);
      ws.addRow([]);

      // Add chart title
      const chartTitleRow = ws.addRow(['Habit Streaks Visualization']);
      chartTitleRow.font = { bold: true, size: 14 };
      ws.addRow([]);

      // Add chart image
      const imageData = await captureChart(streaksChartRef.current);
      if (imageData) {
        const imageId = workbook.addImage({
          base64: imageData.split(',')[1],
          extension: 'png',
        });

        ws.addImage(imageId, {
          tl: { col: 0, row: ws.rowCount },
          ext: { width: 600, height: 400 }
        });
        
        // Add space after chart
        for (let i = 0; i < 22; i++) {
          ws.addRow([]);
        }
      }
    }

    // Goal Completion Rate
    if (goalCompletionRate) {
      const ws = workbook.addWorksheet('Goal Completion');
      ws.columns = Object.keys(goalCompletionRate[0]).map(key => ({ 
        header: key, 
        key,
        width: 15 
      }));
      ws.addRows(goalCompletionRate);

      ws.addRow([]);
      ws.addRow([]);

      const chartTitleRow = ws.addRow(['Goal Completion Rate Visualization']);
      chartTitleRow.font = { bold: true, size: 14 };
      ws.addRow([]);

      const imageData = await captureChart(completionChartRef.current);
      if (imageData) {
        const imageId = workbook.addImage({
          base64: imageData.split(',')[1],
          extension: 'png',
        });

        ws.addImage(imageId, {
          tl: { col: 0, row: ws.rowCount },
          ext: { width: 600, height: 400 }
        });
        
        for (let i = 0; i < 22; i++) {
          ws.addRow([]);
        }
      }
    }

    // Category Distribution
    if (categoryDistribution) {
      const ws = workbook.addWorksheet('Category Distribution');
      ws.columns = Object.keys(categoryDistribution[0]).map(key => ({ 
        header: key, 
        key,
        width: 15 
      }));
      ws.addRows(categoryDistribution);

      ws.addRow([]);
      ws.addRow([]);

      const chartTitleRow = ws.addRow(['Category Distribution Visualization']);
      chartTitleRow.font = { bold: true, size: 14 };
      ws.addRow([]);

      const imageData = await captureChart(categoryChartRef.current);
      if (imageData) {
        const imageId = workbook.addImage({
          base64: imageData.split(',')[1],
          extension: 'png',
        });

        ws.addImage(imageId, {
          tl: { col: 0, row: ws.rowCount },
          ext: { width: 600, height: 400 }
        });
        
        for (let i = 0; i < 22; i++) {
          ws.addRow([]);
        }
      }
    }

    // Habit Balance
    if (habitBalance) {
      const ws = workbook.addWorksheet('Habit Balance');
      ws.columns = Object.keys(habitBalance).map(key => ({ 
        header: key, 
        key,
        width: 15 
      }));
      ws.addRow(habitBalance);

      ws.addRow([]);
      ws.addRow([]);

      const chartTitleRow = ws.addRow(['Habit Balance Visualization']);
      chartTitleRow.font = { bold: true, size: 14 };
      ws.addRow([]);

      const imageData = await captureChart(balanceChartRef.current);
      if (imageData) {
        const imageId = workbook.addImage({
          base64: imageData.split(',')[1],
          extension: 'png',
        });

        ws.addImage(imageId, {
          tl: { col: 0, row: ws.rowCount },
          ext: { width: 600, height: 400 }
        });
        
        for (let i = 0; i < 22; i++) {
          ws.addRow([]);
        }
      }
    }

    // Set column widths for all worksheets
    workbook.worksheets.forEach(worksheet => {
      // Ensure first column is wide enough for charts
      worksheet.getColumn(1).width = 80;
      
      // Set reasonable widths for other columns
      worksheet.columns.forEach((column: any, index) => {
        if (index > 0 && !column.width) {
          column.width = 15;
        }
      });
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `habits-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;
    saveAs(blob, fileName);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
        <Button
          onClick={handleDownloadReport}
          disabled={isLoadingStreaks || isLoadingCategoryDistribution || isLoadingGoalCompletionRate || isLoadingHabitBalance}
        >
          <FileJson className="h-4 w-4" />
          {t('analytics.export.downloadReport')}
        </Button>
      </div>

      {/* Date range picker */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.dateRange.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-2">
              <Label htmlFor="from">{t('analytics.dateRange.from')}</Label>
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
                      <span>{t('analytics.dateRange.pickDate')}</span>
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
              <Label htmlFor="to">{t('analytics.dateRange.to')}</Label>
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
                      <span>{t('analytics.dateRange.pickDate')}</span>
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
              title={t('analytics.cards.totalHabits')}
              value={habitBalance ? (habitBalance.goodHabits + habitBalance.badHabits).toString() : "-"}
              trend="up"
              percentage={habitBalance ? t('analytics.cards.goodHabitsPercentage', {
                percentage: ((habitBalance.goodHabits / (habitBalance.goodHabits + habitBalance.badHabits)) * 100).toFixed(0)
              }) : "-"}
            />
            <OverviewCard
              title={t('analytics.cards.goodHabitCompletion')}
              value={habitBalance ? `${habitBalance.goodHabitCompletionRate.toFixed(0)}%` : "-"}
              trend={habitBalance && habitBalance.goodHabitCompletionRate > 50 ? "up" : "down"}
              percentage={t('analytics.cards.habitsCount', { count: habitBalance ? habitBalance.goodHabits : 0 })}
            />
            <OverviewCard
              title={t('analytics.cards.badHabitAvoidance')}
              value={habitBalance ? `${(100 - habitBalance.badHabitCompletionRate).toFixed(0)}%` : "-"}
              trend={habitBalance && habitBalance.badHabitCompletionRate < 50 ? "up" : "down"}
              percentage={t('analytics.cards.habitsCount', { count: habitBalance ? habitBalance.badHabits : 0 })}
            />
            <OverviewCard
              title={t('analytics.cards.categories')}
              value={categoryDistribution ? categoryDistribution.length.toString() : "-"}
              trend="up"
              percentage={t('analytics.cards.habitsCount', {
                count: categoryDistribution ? categoryDistribution.reduce((sum, cat) => sum + cat.habitCount, 0) : 0
              })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div ref={streaksChartRef}>
              <HabitStreaksChart data={habitStreaks || []} />
            </div>
            <div ref={completionChartRef}>
              <GoalCompletionRateChart data={goalCompletionRate || []} />
            </div>
            <div ref={categoryChartRef}>
              <HabitCategoryChart data={categoryDistribution || []} />
            </div>
            <div ref={balanceChartRef}>
              <HabitBalanceChart data={habitBalance} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OverviewCard({ title, value, trend, percentage }: {
  title: string;
  value: string;
  trend: "up" | "down";
  percentage: string;
}) {
  const t = useTranslations();
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
        <p className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
          {percentage !== "N/A" ? percentage : t('common.notAvailable')}
        </p>
      </CardContent>
    </Card>
  );
}

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tooltip for line chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2">
        <p className="font-medium mb-1">{format(new Date(label), 'PPP')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${Number(entry.value).toFixed(1)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  const t = useTranslations('analytics');
  
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const percentage = payload[0].payload.percentage || 0;
    const habitForm = value === 1 
      ? t('charts.habitBalance.habit') 
      : t('charts.habitBalance.habits');
    
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2 text-sm">
        <p className="font-medium">
          {`${payload[0].name}: ${value} ${habitForm} (${percentage}%)`}
        </p>
      </div>
    );
  }
  return null;
};

// Add this with other custom tooltips
const CustomCategoryTooltip = ({ active, payload }: any) => {
  const t = useTranslations('analytics');
  
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const total = payload[0].payload.total;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    const habitForm = value === 1 
      ? t('charts.habitBalance.habit') 
      : t('charts.habitBalance.habits');
    
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2 text-sm">
        <p className="font-medium">
          {`${payload[0].name}: ${value} ${habitForm} (${percentage}%)`}
        </p>
      </div>
    );
  }
  return null;
};

function HabitStreaksChart({ data }: { data: any[] }) {
  const t = useTranslations('analytics');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.habitStreaks.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="habitName" className="text-foreground" />
            <YAxis className="text-foreground" />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
            <Bar 
              dataKey="currentStreak" 
              fill="#fbbf24" 
              name={t('charts.habitStreaks.currentStreak')} 
            />
            <Bar 
              dataKey="maxStreak" 
              fill="#fcd34d" 
              name={t('charts.habitStreaks.maxStreak')} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function GoalCompletionRateChart({ data }: { data: any[] }) {
  const t = useTranslations('analytics');
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.goalCompletion.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={sortedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), t('charts.dateFormat.short'))}
              interval="preserveStartEnd"
              minTickGap={30}
              className="text-foreground"
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-foreground"
            />
            <Tooltip content={<CustomLineTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#fbbf24"
              activeDot={{ r: 8 }}
              name={t('charts.goalCompletion.rate')}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HabitCategoryChart({ data }: { data: CategoryDistribution[] }) {
  const t = useTranslations('analytics');
  const totalHabits = data.reduce(
    (sum, category) => sum + category.habitCount,
    0
  );

  // Ensure data is properly formatted for the chart
  const chartData = data.map((category) => ({
    name: category.categoryName,
    value: category.habitCount,
    total: totalHabits // Add total to each data point for the tooltip
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.habitCategories.title')}</CardTitle>
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
            <Tooltip content={<CustomCategoryTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('charts.habitCategories.total')}: {totalHabits} {totalHabits === 1 
            ? t('charts.habitBalance.habits') 
            : t('charts.habitBalance.habits')}
        </div>
      </CardContent>
    </Card>
  );
}

function HabitBalanceChart({ data }: { data: any }) {
  const t = useTranslations('analytics');
  const chartData = data
    ? [
        { 
          name: t('charts.habitBalance.goodHabits'), 
          value: data.goodHabits || 0,
        },
        { 
          name: t('charts.habitBalance.badHabits'), 
          value: data.badHabits || 0,
        },
      ]
    : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Pre-calculate percentages
  const dataWithPercentages = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.habitBalance.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name} ${percentage}%`}
            >
              <Cell fill="#fbbf24" />
              <Cell fill="#fcd34d" />
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('charts.habitBalance.total')}: {total} {total === 1 
            ? t('charts.habitBalance.habit') 
            : t('charts.habitBalance.habits')}
        </div>
      </CardContent>
    </Card>
  );
}
