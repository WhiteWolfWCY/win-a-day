import { google } from 'googleapis';
import { db } from "@/db/drizzle";
import { OAuth2Client } from 'google-auth-library';
import { eq } from 'drizzle-orm';
import { GoogleCalendarTokens, Users } from '@/db/schema';

// Initialize OAuth2 client with window.location.origin
const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
);



// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Save user's calendar tokens to database
export async function saveUserCalendarTokens(userId: string, tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}) {
  await db
    .insert(GoogleCalendarTokens)
    .values({
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    })
    .onConflictDoUpdate({
      target: [GoogleCalendarTokens.userId],
      set: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        updatedAt: new Date(),
      },
    });
}

// Get authenticated Google client for a user
export async function getGoogleAuthClient(userId: string): Promise<OAuth2Client> {
  const [tokens] = await db
    .select()
    .from(GoogleCalendarTokens)
    .where(eq(GoogleCalendarTokens.userId, userId));

  if (!tokens) {
    throw new Error('No Google Calendar tokens found for user');
  }

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken || undefined,
    expiry_date: tokens.expiryDate?.getTime(),
  });

  // Set up token refresh handler
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await saveUserCalendarTokens(userId, tokens as {
        access_token: string;
        refresh_token?: string;
        expiry_date?: number;
      });
    }
  });

  return oauth2Client;
} 