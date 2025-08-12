import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '@/config/api';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface VisualExplanationRequest {
  code: string;
  language: string;
}

interface FlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { label: string };
  style?: Record<string, any>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

interface VisualExplanationResponse {
  nodes: FlowNode[];
  edges: FlowEdge[];
  title: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { code, language }: VisualExplanationRequest = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Create the prompt for Gemini
    const prompt = `
    You are an expert software visualization tool. Your task is to analyze the provided code and generate a beginner-friendly visual representation of its logic flow with every code logic represented by a code block .
    
    CODE (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Create a flowchart or diagram that explains the control flow and logic of this code. 
    
    Return ONLY a JSON object with the following structure:
    {
      "nodes": [
        {
          "id": "unique-id",
          "position": { "x": number, "y": number },
          "data": { "label": "Node Label Text" },
          "style": { "background": "color", "border": "color", "width": number, "borderRadius": number }
        },
        ...more nodes
      ],
      "edges": [
        {
          "id": "unique-id",
          "source": "source-node-id",
          "target": "target-node-id",
          "label": "optional label",
          "animated": boolean,
          "style": { "stroke": "color" }
        },
        ...more edges
      ],
      "title": "Brief title describing the visualization",
      "description": "Short explanation of what this diagram shows"
    }
    
    IMPORTANT GUIDELINES:
    1. Position nodes in a logical flow (top-to-bottom or left-to-right)
    2. Start x,y positions at (0,0) and space nodes at least 150px apart
    3. Keep node labels concise but descriptive
    4. Use different node styles/colors for different types of operations
    5. Include conditional branches, loops, and function calls
    6. Make sure all node IDs are unique
    7. Ensure every edge connects existing nodes
    8. The diagram should be complete but not overly complex
    `;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response
    let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                    text.match(/```\s*([\s\S]*?)\s*```/) || 
                    text.match(/(\{[\s\S]*\})/);
                    
    let visualData: VisualExplanationResponse;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        visualData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", e);
        console.log("Raw response:", text);
        return NextResponse.json(
          { error: 'Failed to parse visualization data' },
          { status: 500 }
        );
      }
    } else {
      try {
        // Try parsing the entire text as JSON
        visualData = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse entire response as JSON:", e);
        console.log("Raw response:", text);
        return NextResponse.json(
          { error: 'Invalid visualization data format' },
          { status: 500 }
        );
      }
    }

    // Validate the structure of the visualization data
    if (!visualData.nodes || !Array.isArray(visualData.nodes) || 
        !visualData.edges || !Array.isArray(visualData.edges)) {
      return NextResponse.json(
        { error: 'Invalid visualization data structure' },
        { status: 500 }
      );
    }

    // Return the visualization data
    return NextResponse.json(visualData);
    
  } catch (error) {
    console.error('Error generating visual explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate visual explanation' },
      { status: 500 }
    );
  }
}
