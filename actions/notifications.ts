"use server";

import { db } from "@/db/drizzle";
import { UserNotificationSettings, NotificationFrequency, Users } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

export async function getUserNotificationSettings(userId: string) {
  const [settings] = await db
    .select()
    .from(UserNotificationSettings)
    .where(eq(UserNotificationSettings.userId, userId));

  return settings;
}

export async function updateUserNotificationSettings(
  userId: string,
  settings: Partial<typeof UserNotificationSettings.$inferInsert>
) {
  const [existingSettings] = await db
    .select()
    .from(UserNotificationSettings)
    .where(eq(UserNotificationSettings.userId, userId));

  if (existingSettings) {
    const [updated] = await db
      .update(UserNotificationSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(UserNotificationSettings.userId, userId))
      .returning();
    return updated;
  }

  // Create default settings if none exist
  const [newSettings] = await db
    .insert(UserNotificationSettings)
    .values({
      userId,
      ...settings,
    })
    .returning();

  return newSettings;
}