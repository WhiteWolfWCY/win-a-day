"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Loader from "@/components/Loader";
import ManageCategories from "@/components/ManageCategories";
import { ThemeSelector } from "@/components/ThemeSelector";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <main className="container mx-auto flex-grow flex flex-col gap-6 p-6 z-10">
      <Card className="bg-card backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">User Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center md:items-start gap-6">
            <Avatar className="w-44 h-44 mt-auto">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
              <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-lg font-semibold">{user?.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                <p className="text-lg">{format(new Date(user?.createdAt || ''), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card backdrop-blur-sm mt-6">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Theme</Label>
              <div className="flex items-center space-x-2 mt-2">
                <ThemeSelector />
                <p className="text-sm text-gray-500">Choose your preferred theme mode</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ManageCategories />
    </main>
  );
}
