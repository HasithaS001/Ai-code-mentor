import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, GEMINI_MODEL } from '../../../config/api';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { projectId, message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    // Create a prompt for the AI assistant
    const prompt = `You are a helpful coding mentor assistant. Answer the following question about the project:
    
    Project ID: ${projectId}
    User Question: ${message}
    
    Provide a clear, concise, and helpful response. If you're explaining code concepts, use simple language and examples.`;
    
    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ response: response.text() });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
