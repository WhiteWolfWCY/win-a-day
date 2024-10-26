"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  BarChart,
  Bar,
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

const overviewData = {
  goalCompletion: [
    { name: "Completed", value: 65 },
    { name: "Remaining", value: 35 },
  ],
  habitAdherence: [
    { name: "Good Habits", completed: 80, total: 100 },
    { name: "Bad Habits Avoided", completed: 70, total: 100 },
  ],
};

const COLORS = ["#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"];

export default function OverviewSection() {
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
                  data={overviewData.goalCompletion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overviewData.goalCompletion.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Habit Adherence</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={overviewData.habitAdherence}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#fbbf24" /> {/* Amber-400 */}
                <Bar dataKey="total" fill="#fef3c7" /> {/* Amber-100 */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
