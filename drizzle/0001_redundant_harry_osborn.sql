CREATE TYPE "public"."priority" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TYPE "public"."weekdays" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goals" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"finishDate" date NOT NULL,
	"startDate" date DEFAULT now() NOT NULL,
	"isCompleted" boolean DEFAULT false,
	"userId" text,
	"priority" "priority" NOT NULL,
	"habitId" integer,
	"goalSuccess" integer NOT NULL,
	"weekdays" weekdays[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goalsAttempts" (
	"id" integer PRIMARY KEY NOT NULL,
	"goalId" integer,
	"date" date NOT NULL,
	"isCompleted" boolean DEFAULT false,
	"note" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habits" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"categoryId" integer,
	"userId" text,
	"isGoodHabit" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "joinDate" date DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_habitId_habits_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goalsAttempts" ADD CONSTRAINT "goalsAttempts_goalId_goals_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habits" ADD CONSTRAINT "habits_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");