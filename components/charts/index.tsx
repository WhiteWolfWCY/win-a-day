import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { CategoryDistribution } from "@/actions/actions";
import { useTranslations } from 'next-intl';
import { CustomPieTooltip, CustomLineTooltip } from './tooltips';
import { format } from 'date-fns';

const COLORS = ["#fbbf24", "#fcd34d", "#fde68a", "#fef3c7", "#fffbeb"];

export function HabitCategoryChart({ data }: { data: CategoryDistribution[] }) {
  const t = useTranslations('profile');
  const totalHabits = data.reduce((sum, category) => sum + category.habitCount, 0);

  const chartData = data.map((category) => ({
    name: category.categoryName || t('charts.noCategory'),
    value: category.habitCount,
    total: totalHabits
  }));

  return (
    <Card>
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HabitBalanceChart({ data }: { data: any }) {
  const t = useTranslations('profile');
  const chartData = data
    ? [
        { 
          name: t('charts.habitBalance.goodHabits'), 
          value: data.goodHabits || 0,
          total: (data.goodHabits || 0) + (data.badHabits || 0)
        },
        { 
          name: t('charts.habitBalance.badHabits'), 
          value: data.badHabits || 0,
          total: (data.goodHabits || 0) + (data.badHabits || 0)
        },
      ]
    : [];

  return (
    <Card>
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              <Cell fill="#fbbf24" />
              <Cell fill="#fcd34d" />
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function GoalCompletionChart({ data }: { data: any[] }) {
  const t = useTranslations('profile');
  
  return (
    <Card>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), t('charts.dateFormat'))}
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
              name={t('charts.goalCompletion.rate')}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 