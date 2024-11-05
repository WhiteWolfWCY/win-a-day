CREATE TYPE "public"."notification_frequency" AS ENUM('Daily', 'Weekly', 'Monthly', 'Never');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text,
	"notifications_enabled" boolean DEFAULT true,
	"email_notifications_enabled" boolean DEFAULT true,
	"achievement_notifications" boolean DEFAULT true,
	"goal_completion_notifications" boolean DEFAULT true,
	"goal_updates_notifications" boolean DEFAULT true,
	"habit_updates_notifications" boolean DEFAULT true,
	"reminder_frequency" "notification_frequency" DEFAULT 'Daily',
	"reminder_time" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
