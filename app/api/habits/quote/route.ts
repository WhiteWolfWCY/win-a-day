import { db } from "@/db/drizzle";
import { HabitQuotes } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { habitId, quote } = await req.json();

    await db.insert(HabitQuotes).values({
      habitId,
      quote: quote.text,
      author: quote.author,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error attaching quote:", error);
    return NextResponse.json(
      { error: "Failed to attach quote" },
      { status: 500 }
    );
  }
} 