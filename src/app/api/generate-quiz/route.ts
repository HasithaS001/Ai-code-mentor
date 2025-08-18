import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '@/config/api';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define quiz data interface
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  questions: QuizQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, difficulty = 'beginner', questionCount = 5, fullFileAnalysis = false } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Code content is required' }, { status: 400 });
    }
    
    console.log(`Generating quiz for ${language} code, difficulty: ${difficulty}, requesting ${questionCount} questions, full file analysis: ${fullFileAnalysis}`);
    
    // Generate quiz using Gemini
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const prompt = `
      You are an expert coding instructor. Generate a comprehensive quiz based on the following code.
      The quiz should be suitable for ${difficulty} level programmers.
      
      Code (${language}):
      \`\`\`${language}
      ${code}
      \`\`\`
      
      ${fullFileAnalysis ? 'Analyze the ENTIRE file thoroughly, not just specific snippets. Cover all important concepts, patterns, and functionality in the file.' : 'Focus on the most important aspects of the code.'}
      
      Create ${questionCount} multiple-choice questions that test understanding of:
      1. The purpose and functionality of the code
      2. Key concepts demonstrated in the code
      3. Potential bugs or edge cases
      4. Design patterns and architectural decisions
      5. Best practices and code quality aspects
      6. Performance considerations
      7. Security implications (if applicable)
      
      Format each question with:
      - A clear question
      - 4 possible answers (A, B, C, D)
      - The correct answer marked with [CORRECT]
      - A brief explanation of why that answer is correct
      
      Return the response as a JSON object with this structure:
      {
        "questions": [
          {
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0, // Index of correct answer (0-3)
            "explanation": "Explanation of the correct answer"
          }
        ]
      }
      
      IMPORTANT: Generate EXACTLY ${questionCount} questions. Make sure the questions cover different aspects of the code and vary in difficulty.
    `;
    
    let quizData: QuizData = { questions: [] };
    
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log('Received response from Gemini API');
      
      // Extract JSON from the response
      try {
        // Find JSON in the response (it might be wrapped in markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]) as QuizData;
          quizData = parsedData;
          console.log('Successfully parsed quiz data');
        } else {
          console.error('No JSON found in response');
          console.log('Response text:', text.substring(0, 200) + '...');
          throw new Error('Could not extract JSON from response');
        }
      } catch (error) {
        const jsonError = error as Error;
        console.error('Error parsing quiz data:', jsonError);
        console.log('Response text:', text.substring(0, 200) + '...');
        return NextResponse.json({ 
          error: 'Failed to parse quiz data. Please try again.',
          details: jsonError.message
        }, { status: 500 });
      }
      
      // Validate quiz data structure
      if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        console.error('Invalid quiz data structure:', quizData);
        return NextResponse.json({ 
          error: 'Invalid quiz data structure. Please try again.' 
        }, { status: 500 });
      }
      
      return NextResponse.json(quizData);
    } catch (error) {
      const apiError = error as Error;
      console.error('Error calling Gemini API:', apiError);
      return NextResponse.json({ 
        error: 'Failed to generate quiz. API error.',
        details: apiError.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    const generalError = error as Error;
    console.error('Error generating quiz:', generalError);
    return NextResponse.json({ 
      error: 'Failed to generate quiz. Please try again.',
      details: generalError.message || 'Unknown error' 
    }, { status: 500 });
  }
}
