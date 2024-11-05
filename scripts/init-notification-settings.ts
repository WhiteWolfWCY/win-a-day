import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { Users, UserNotificationSettings, NotificationFrequency } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function init() {
  try {
    console.log("Initializing notification settings for existing users...");
    
    const usersWithoutSettings = await db
      .select({
        id: Users.id,
      })
      .from(Users)
      .leftJoin(
        UserNotificationSettings,
        eq(Users.id, UserNotificationSettings.userId)
      )
      .where(isNull(UserNotificationSettings.id));

    const defaultReminderTime = new Date();
    defaultReminderTime.setHours(9, 0, 0, 0);

    for (const user of usersWithoutSettings) {
      await db.insert(UserNotificationSettings).values({
        userId: user.id,
        notificationsEnabled: true,
        emailNotificationsEnabled: true,
        achievementNotifications: true,
        goalCompletionNotifications: true,
        goalUpdatesNotifications: true,
        habitUpdatesNotifications: true,
        reminderFrequency: NotificationFrequency.DAILY,
        reminderTime: defaultReminderTime,
      });
      console.log(`Created notification settings for user: ${user.id}`);
    }

    console.log(`Successfully initialized notification settings for ${usersWithoutSettings.length} users`);
  } catch (error) {
    console.error("Error initializing notification settings:", error);
  } finally {
    await client.end();
  }
}

init(); 