"use server";

import { google } from 'googleapis';
import { db } from "@/db/drizzle";
import { GoalsAttempts, GoalCalendarSync } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getGoogleAuthClient } from '@/lib/googleCalendar';

export async function updateGoalCalendarSync(
  userId: string,
  goalId: string,
  goalName: string,
  enabled: boolean
) {
  const oauth2Client = await getGoogleAuthClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  if (!enabled) {
    // Delete all calendar events for this goal's attempts
    const attempts = await db
      .select()
      .from(GoalsAttempts)
      .where(eq(GoalsAttempts.goalId, goalId));

    for (const attempt of attempts) {
      if (attempt.calendarEventId) {
        try {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: attempt.calendarEventId,
          });

          // Clear the calendarEventId from the attempt
          await db.update(GoalsAttempts)
            .set({ calendarEventId: null })
            .where(eq(GoalsAttempts.id, attempt.id));
        } catch (error) {
          console.error('Failed to delete calendar event:', error);
        }
      }
    }

    // Update sync settings
    await db.update(GoalCalendarSync)
      .set({ isEnabled: false })
      .where(and(
        eq(GoalCalendarSync.goalId, goalId),
        eq(GoalCalendarSync.userId, userId)
      ));

    return;
  }

  // Update sync settings
  await db.insert(GoalCalendarSync)
    .values({ goalId, userId, isEnabled: true })
    .onConflictDoUpdate({
      target: [GoalCalendarSync.goalId, GoalCalendarSync.userId],
      set: { isEnabled: true }
    });

  // Sync all attempts for this goal
  const attempts = await db
    .select()
    .from(GoalsAttempts)
    .where(eq(GoalsAttempts.goalId, goalId));

  for (const attempt of attempts) {
    if (attempt.calendarEventId) continue; // Skip if already synced

    // Convert the date string to a Date object and format it
    const attemptDate = new Date(attempt.date);
    const dateString = attemptDate.toISOString().split('T')[0];

    const event = {
      summary: `Goal: ${goalName}`,
      description: `Attempt for goal: ${goalName}`,
      start: {
        date: dateString,
        timeZone: 'UTC',
      },
      end: {
        date: dateString,
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: true,
      },
    };

    try {
      const calendarEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      // Update attempt with calendar event ID
      await db.update(GoalsAttempts)
        .set({ calendarEventId: calendarEvent.data.id })
        .where(eq(GoalsAttempts.id, attempt.id));
    } catch (error) {
      console.error('Failed to create calendar event:', error);
    }
  }
} 