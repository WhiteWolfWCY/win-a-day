import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createCategory, createUser } from '@/actions/actions'
import { db } from "@/db/drizzle";
import { UserNotificationSettings, NotificationFrequency } from "@/db/schema";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint

  
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const CATEGORIES = ["Physical", "Mental", "Emotional", "Financial", "Social", "Spiritual", "Self-Care"]

  if(evt.type === 'user.created') {
    const userData = {
        id: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: evt.data.first_name + ' ' + evt.data.last_name,
        imgUrl: evt.data.image_url,
        joinDate: new Date().toISOString(),
    }
    
    // Create user
    await createUser(userData)

    // Create default categories
    for (const category of CATEGORIES) {
        await createCategory({
            name: category,
            userId: evt.data.id,
        })
    }

    // Create default notification settings
    const defaultReminderTime = new Date();
    defaultReminderTime.setHours(9, 0, 0, 0); // Set default reminder time to 9 AM

    await db.insert(UserNotificationSettings).values({
      userId: evt.data.id,
      notificationsEnabled: true,
      emailNotificationsEnabled: true,
      achievementNotifications: true,
      goalCompletionNotifications: true,
      goalUpdatesNotifications: true,
      habitUpdatesNotifications: true,
      reminderFrequency: NotificationFrequency.DAILY,
      reminderTime: defaultReminderTime,
    });
  }

  return new Response('', { status: 200 })
}