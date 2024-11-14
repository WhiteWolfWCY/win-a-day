import { openai } from '@/lib/openai';
import { getUserHabits, getAllUserGoals } from '@/actions/actions';
import { NextResponse } from 'next/server';
import { getLocale } from 'next-intl/dist/types/src/server/react-server';

export async function POST(
  req: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const { userId, message, history } = await req.json();
    
    // Get user's habits and goals for context
    const habits = await getUserHabits(userId);
    const goals = await getAllUserGoals(userId);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant specializing in habit formation and goal achievement.
          You have access to the user's current habits and goals for context.
          Please provide your response in the same language user is using.
          Be encouraging and supportive while providing practical advice.
          Format your responses using markdown for better readability.
          If the message is not about habits or goals, or personal development, respond with "I'm sorry, I can only help with habits and goals.
          Current user context:
          ${JSON.stringify({ habits, goals }, null, 2)}`
        },
        ...history.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.error();
  }
} 