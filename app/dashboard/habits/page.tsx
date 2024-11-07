"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getAllHabitsForUser } from "@/actions/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Plus } from "lucide-react";
import Loader from "@/components/Loader";
import HabitMenu from "@/components/HabitOptionsDropdown";
import AddHabitDialog from "@/components/AddHabitDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HabitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const itemsPerPage = 10;

  const { data: habits, isLoading } = useQuery({
    queryKey: ["user-habits", userId],
    queryFn: async () => await getAllHabitsForUser(userId!),
    enabled: !!userId,
  });

  const filteredHabits = habits?.filter((habit) =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedHabits = filteredHabits?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((filteredHabits?.length || 0) / itemsPerPage);

  return (
    <main className="container mx-auto flex-grow flex flex-col gap-6 p-6 z-10">
      <Card className="bg-opacity-80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">All Habits</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Habit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <Loader />
          ) : paginatedHabits && paginatedHabits.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Good Habit?</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHabits.map((habit) => (
                    <TableRow key={habit.id}>
                      <TableCell>{habit.name}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <span>{habit.habitCategoryIcon}</span>
                          <span>{habit.habitCategory}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        {habit.isGoodHabit ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <HabitMenu
                          habitId={habit.id}
                          habitName={habit.name}
                          categoryId={habit.categoryId}
                          isGoodHabit={habit.isGoodHabit || false}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  {">"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">No habits found</p>
            </div>
          )}
        </CardContent>
      </Card>
      <AddHabitDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        showAddButton={false}
      />
    </main>
  );
}
