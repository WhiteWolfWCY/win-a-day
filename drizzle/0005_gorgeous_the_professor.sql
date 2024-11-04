CREATE TABLE IF NOT EXISTS "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text,
	"totalHabits" integer DEFAULT 0,
	"completedGoals" integer DEFAULT 0,
	"goodHabitStreak" integer DEFAULT 0,
	"achievementsUnlocked" integer DEFAULT 0,
	"totalScore" integer DEFAULT 0,
	"lastUpdated" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "imageUrl" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
