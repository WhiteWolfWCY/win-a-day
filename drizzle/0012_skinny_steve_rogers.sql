CREATE TABLE IF NOT EXISTS "habit_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habitId" uuid,
	"quote" text NOT NULL,
	"author" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_quotes" ADD CONSTRAINT "habit_quotes_habitId_habits_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
