import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { exchangeCodeForTokens } from "@/lib/googleCalendar";
import { saveUserCalendarTokens } from "@/lib/googleCalendar";

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pl/dashboard/settings?error=unauthorized`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveUserCalendarTokens(userId, tokens as {
      access_token: string;
      refresh_token?: string;
      expiry_date?: number;
    });
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pl/dashboard/settings?success=true`);
  } catch (error) {
    console.error("Google Calendar auth error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pl/dashboard/settings?error=failed`);
  }
} 