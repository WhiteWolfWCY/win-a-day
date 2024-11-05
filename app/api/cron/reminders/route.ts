import { NextResponse } from "next/server";
import { sendDailyReminders } from "@/actions/notifications/reminders";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Verify that this is a legitimate cron request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await sendDailyReminders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
} 