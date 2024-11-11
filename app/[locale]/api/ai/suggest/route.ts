import { openai } from '@/lib/openai';
import { getUserHabits, getAllUserGoals } from '@/actions/actions';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const { userId } = await req.json();
    const locale = params.locale;
    
    // Get user's habits and goals
    const habits = await getUserHabits(userId);
    const goals = await getAllUserGoals(userId);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a habit-building and personal development expert. Based on the user's current habits and goals, suggest new habits and goals that would complement their journey.
          Please provide your response in ${locale === 'en' ? 'English' : 'Polish'} language.
          Format your response as a JSON object with two arrays: 'habits' and 'goals'.
          Each habit and goal should have a 'name' and 'reason' property.
          Limit to 3 habits and 3 goals maximum.`
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
            }))
          })
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const suggestions = JSON.parse(completion.choices[0].message.content!);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in AI suggestions:', error);
    return NextResponse.error();
  }
} 