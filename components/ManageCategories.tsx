"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getUserCategories } from "@/actions/actions";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CategoryMenu from "@/components/CategoryOptionsDropdown";
import AddCategoryDialog from "@/components/AddCategoryDialog";
import Loader from "./Loader";
import { Plus } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function ManageCategories() {
  const t = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { userId } = useAuth();
  const itemsPerPage = 5;

  const { data: categories, isLoading } = useQuery({
    queryKey: ["user-categories", userId],
    queryFn: async () => await getUserCategories(userId!),
    enabled: !!userId,
  });

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCategories = filteredCategories?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(
    (filteredCategories?.length || 0) / itemsPerPage
  );

  return (
    <Card className="bg-opacity-80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          {t('settings.categories.manageTitle')}
        </CardTitle>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 
          {t('settings.categories.addButton')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder={t('settings.categories.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading ? (
          <Loader />
        ) : paginatedCategories && paginatedCategories.length > 0 ? (
          <>
            {paginatedCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between py-2"
              >
                <span>{category.icon} {category.name}</span>
                <CategoryMenu
                  categoryId={category.id}
                  categoryName={category.name}
                  categoryIcon={category.icon}
                />
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label={t('common.previousPage')}
                >
                  {"<"}
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  aria-label={t('common.nextPage')}
                >
                  {">"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            {t('settings.categories.noCategories')}
          </p>
        )}
        <AddCategoryDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
