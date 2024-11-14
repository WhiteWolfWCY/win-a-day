CREATE TABLE IF NOT EXISTS "goal_calendar_sync" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goalId" uuid,
	"userId" text,
	"is_enabled" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "goalsAttempts" ADD COLUMN "calendar_event_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_calendar_sync" ADD CONSTRAINT "goal_calendar_sync_goalId_goals_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_calendar_sync" ADD CONSTRAINT "goal_calendar_sync_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
