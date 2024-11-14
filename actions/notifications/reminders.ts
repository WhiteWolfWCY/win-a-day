import { db } from "@/db/drizzle";
import { UserNotificationSettings, NotificationFrequency } from "@/db/schema";
import { sendEmailToUser } from "../email";
import { eq, and, or, sql } from "drizzle-orm";

export async function sendDailyReminders() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get all users who have either:
  // 1. Daily reminders enabled
  // 2. Weekly reminders enabled and it's Monday
  const usersToNotify = await db
    .select()
    .from(UserNotificationSettings)
    .where(
      and(
        // Basic notification settings must be enabled
        eq(UserNotificationSettings.notificationsEnabled, true),
        eq(UserNotificationSettings.emailNotificationsEnabled, true),
        // Either daily notifications OR weekly notifications on Monday
        or(
          eq(UserNotificationSettings.reminderFrequency, NotificationFrequency.DAILY),
          and(
            eq(UserNotificationSettings.reminderFrequency, NotificationFrequency.WEEKLY),
            sql`EXTRACT(DOW FROM CURRENT_DATE) = 1` // 1 = Monday
          )
        )
      )
    );

  const remindersPromises = usersToNotify.map(async (user) => {
    try {
      // Customize message based on frequency
      const isWeekly = user.reminderFrequency === NotificationFrequency.WEEKLY;
      const message = isWeekly 
        ? `
          <p>Hi there!</p>
          <p>This is your weekly reminder to check on your goals and habits.</p>
          <p>Take some time to review your progress and plan for the week ahead!</p>
        `
        : `
          <p>Hi there!</p>
          <p>This is your daily reminder to check on your goals and habits.</p>
          <p>Keep up the great work!</p>
        `;

      await sendEmailToUser(user.userId!, {
        subject: isWeekly ? "🎯 Weekly Goals & Habits Check-in" : "🌟 Daily Goals & Habits Reminder",
        title: isWeekly ? "Your Weekly Check-in" : "Your Daily Reminder",
        message,
        callToAction: {
          text: "View Dashboard",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        }
      });
      
      console.log(`${isWeekly ? 'Weekly' : 'Daily'} reminder sent to user: ${user.userId}`);
    } catch (error) {
      console.error(`Failed to send reminder to user ${user.userId}:`, error);
    }
  });

  await Promise.all(remindersPromises);
} 