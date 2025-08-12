import { NextRequest, NextResponse } from 'next/server';
import { explainCodeSnippet } from '../../../utils/gemini';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code snippet is required' },
        { status: 400 }
      );
    }

    // Get explanation from Gemini
    const explanation = await explainCodeSnippet(code);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error in explain-code API:', error);
    return NextResponse.json(
      { error: 'Failed to explain code snippet' },
      { status: 500 }
    );
  }
}
