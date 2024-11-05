import { getUserNotificationSettings } from "../notifications";
import { sendEmailToUser } from "../email";
import { NotificationFrequency } from "@/db/schema";

type NotificationEvent = {
  userId: string;
  type: 'achievement' | 'goalCompletion' | 'goalUpdate' | 'habitUpdate';
  title: string;
  message: string;
  link?: string;
};

export async function sendNotification(event: NotificationEvent) {
  const settings = await getUserNotificationSettings(event.userId);
  
  if (!settings?.notificationsEnabled) return;

  // Check specific notification type settings
  switch (event.type) {
    case 'achievement':
      if (!settings.achievementNotifications) return;
      break;
    case 'goalCompletion':
      if (!settings.goalCompletionNotifications) return;
      break;
    case 'goalUpdate':
      if (!settings.goalUpdatesNotifications) return;
      break;
    case 'habitUpdate':
      if (!settings.habitUpdatesNotifications) return;
      break;
  }

  // Create full URL for the link
  const fullUrl = event.link 
    ? `${process.env.NEXT_PUBLIC_APP_URL}${event.link}`
    : undefined;

  // Send email if enabled
  if (settings.emailNotificationsEnabled) {
    await sendEmailToUser(event.userId, {
      subject: event.title,
      title: event.title,
      message: event.message,
      ...(fullUrl && {
        callToAction: {
          text: "View Details",
          url: fullUrl
        }
      })
    });
  }
} 