import { db } from "@/db/drizzle";
import { UserNotificationSettings, NotificationFrequency } from "@/db/schema";
import { sendEmailToUser } from "../email";
import { eq, and } from "drizzle-orm";

export async function sendDailyReminders() {
  const now = new Date();
  const currentHour = now.getHours();

  // Get all users who have reminders set for this hour
  const usersToNotify = await db
    .select()
    .from(UserNotificationSettings)
    .where(
      and(
        eq(UserNotificationSettings.reminderFrequency, NotificationFrequency.DAILY),
        eq(UserNotificationSettings.notificationsEnabled, true),
        eq(UserNotificationSettings.emailNotificationsEnabled, true)
      )
    );

  const remindersPromises = usersToNotify.map(async (user) => {
    const reminderTime = new Date(user.reminderTime!);
    if (reminderTime.getHours() === currentHour) {
      try {
        await sendEmailToUser(user.userId!, {
          subject: "🌟 Daily Goals & Habits Reminder",
          title: "Your Daily Reminder",
          message: `
            <p>Hi there!</p>
            <p>This is your daily reminder to check on your goals and habits.</p>
            <p>Keep up the great work!</p>
          `,
          callToAction: {
            text: "View Dashboard",
            url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
          }
        });
        console.log(`Reminder sent to user: ${user.userId}`);
      } catch (error) {
        console.error(`Failed to send reminder to user ${user.userId}:`, error);
      }
    }
  });

  await Promise.all(remindersPromises);
} 