import { openai } from '@/lib/openai';
import { getUserHabits, getAllUserGoals } from '@/actions/actions';
import { NextResponse } from 'next/server';
import { getLocale } from 'next-intl/server';

export async function POST(
  req: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const { userId } = await req.json();
    
    // Get user's habits and goals
    const habits = await getUserHabits(userId);
    const goals = await getAllUserGoals(userId);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a habit-building and personal development expert. Analyze the user's habits and goals to provide insightful recommendations. 
          Please provide your response in the same language user is using.
          Format your response in markdown with proper headings, lists, and emphasis.`
        },
        {
          role: "user",
          content: JSON.stringify({
            habits: habits.map(h => ({
              name: h.name,
              isGoodHabit: h.isGoodHabit,
              category: h.habitCategory
            })),
            goals: goals.map(g => ({
              name: g.name,
              success: g.completedAttempts / g.goalSuccess
            })),
          })
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7, // Add some creativity while keeping responses focused
    });

    return NextResponse.json({
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.error();
  }
} 