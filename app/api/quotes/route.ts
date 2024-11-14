import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides inspiring quotes. For each quote, provide the quote text and its author. Provide exactly 5 quotes in this format: 1. \"quote\" - Author"
        },
        {
          role: "user",
          content: "Give me 5 inspiring quotes about habits, personal growth, and self-improvement."
        }
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error("No response from OpenAI");

    // Parse the response into structured data
    const quotes = response.split('\n').filter(line => line.trim()).map(line => {
      // Remove the number prefix and split by " - "
      const [quote, author] = line.replace(/^\d+\.\s*/, '').split(' - ');
      return {
        // Remove quotes from the quote text
        text: quote.replace(/[""]/g, ''),
        author: author?.trim() || 'Unknown'
      };
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
} 