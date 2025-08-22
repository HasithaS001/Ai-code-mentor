import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config/api";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to get project summary using Gemini
export async function getProjectSummary(projectFiles: { name: string; content: string }[]) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    // Create a prompt for project analysis
    let prompt = `Analyze this project and provide a summary with the following information:
    1. Project overview in natural language
    2. Detected dependencies
    3. Tech stack used
    
    Here are the project files:`;
    
    // Add file contents to the prompt (limit to important files to avoid token limits)
    const importantFiles = projectFiles.filter(file => {
      const lowerName = file.name.toLowerCase();
      return lowerName.includes('package.json') || 
             lowerName.includes('readme') || 
             lowerName.endsWith('.js') || 
             lowerName.endsWith('.ts') || 
             lowerName.endsWith('.jsx') || 
             lowerName.endsWith('.tsx');
    });
    
    for (const file of importantFiles.slice(0, 10)) { // Limit to 10 files to avoid token limits
      prompt += `\n\nFile: ${file.name}\n${file.content.substring(0, 2000)}`; // Limit content size
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing project with Gemini:", error);
    return "Failed to analyze project. Please try again.";
  }
}

// Function to explain code snippet using Gemini
export async function explainCodeSnippet(codeSnippet: string) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const prompt = `Explain this code concisely in 2-3 short paragraphs. Be direct, clear, and to the point. Focus only on the most important aspects. Use simple language and avoid unnecessary details:
    
    ${codeSnippet}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error explaining code with Gemini:", error);
    return "Failed to explain code. Please try again.";
  }
}

// Function to explain code block with beginner-friendly tutorial
export async function explainCodeBlockForBeginners(codeBlock: string, blockTitle: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const prompt = `You are a friendly coding tutor explaining code to absolute beginners. 

Code Block Title: "${blockTitle}"
Programming Language: ${language}
Code to explain:
${codeBlock}

Please provide a beginner-friendly tutorial explanation that:
1. Uses simple, conversational language
2. Explains what this code does in plain English
3. Breaks down complex concepts into easy-to-understand parts
4. Mentions why this code is important or useful
5. Uses analogies or real-world examples when helpful
6. Keeps the explanation engaging and not too technical

Make it sound like a friendly teacher explaining to a student who is just starting to learn programming. Keep it concise but thorough (2-4 paragraphs).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error explaining code block with Gemini:", error);
    return "I'm sorry, I couldn't generate an explanation right now. This code block helps make your program work by organizing and structuring the logic. Try again in a moment!";
  }
}

// Function to break down code into logical blocks for code tour
export async function getCodeTourBlocks(codeContent: string, language: string) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      
      // Add line numbers to code content for reference
      const lines = codeContent.split('\n');
      const numberedCode = lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
      const fileName = "code-file." + (language || "js");
      
      const prompt = `Analyze the following ${language} code from file "${fileName}" and break it down into logical, beginner-friendly code blocks.

IMPORTANT INSTRUCTIONS:
- Break down the code into small, easily digestible chunks that a beginner can understand
- Group related functionality together (imports, setup, core functions, helper functions, etc.)
- Explain each block in simple terms avoiding technical jargon when possible
- Start with the most important/main parts of the code
- For each block, explain what it does and WHY it's important
- Use analogies or real-world examples when helpful
- Highlight any patterns or best practices

CRITICAL: The code provided includes line numbers at the beginning of each line in the format "LINE_NUMBER: code".
- USE THESE EXACT LINE NUMBERS in your response
- Do NOT include these line numbers in the code blocks you return
- The line numbers are there to help you reference the correct lines

For each block, provide:
1. A simple, descriptive title that explains the purpose (e.g., "Setting Up Database Connection" not just "Database Code")
2. A beginner-friendly explanation of what this code does and why it matters
3. The exact code content WITHOUT the line numbers
4. The EXACT line numbers (start and end) using the numbers provided in the code
5. The type of code block (function, class, interface, component, import, variable, other)

Please return the response in the following JSON format:
{
  "summary": "Simple overall explanation of what this file does and how it fits into the application",
  "blocks": [
    {
      "id": "unique_id",
      "title": "Simple Descriptive Title",
      "description": "Beginner-friendly explanation with examples if possible",
      "code": "exact code content WITHOUT line numbers",
      "lineStart": 1,
      "lineEnd": 10,
      "type": "function|class|interface|component|import|variable|other"
    }
  ]
}

Code to analyze:
\`\`\`${language}
${numberedCode}
\`\`\`

Important: Return only valid JSON without any markdown formatting or additional text.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Try to parse the JSON response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          
          // Convert the new format to the expected format by the application
          if (parsedResponse.blocks && Array.isArray(parsedResponse.blocks)) {
            // Define the expected block structure
            interface GeminiBlock {
              id: string;
              title: string;
              description: string;
              code: string;
              lineStart: number;
              lineEnd: number;
              type: string;
            }
            
            interface AppBlock {
              title: string;
              startLine: number;
              endLine: number;
              description: string;
            }
            
            const convertedBlocks = parsedResponse.blocks.map((block: GeminiBlock): AppBlock => ({
              title: block.title,
              startLine: block.lineStart,
              endLine: block.lineEnd,
              description: block.description
            }));
            
            return { blocks: convertedBlocks, summary: parsedResponse.summary };
          }
          return parsedResponse;
        }
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
      }
      
      // Fallback if JSON parsing fails
      return {
        blocks: [
          {
            title: "Code Analysis",
            startLine: 1,
            endLine: codeContent.split('\n').length,
            description: "Unable to parse the code structure. Please try again."
          }
        ]
      };
      
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      // Check if it's a rate limit error and we should retry
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RATE_LIMIT_EXCEEDED')) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`Rate limit hit. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Try again
          }
        }
      }
      
      // If it's the last attempt or not a rate limit error, return error
      if (attempt === maxRetries) {
        let errorMessage = "Gemini API is currently unavailable. Please try again later.";
        
        if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
          if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RATE_LIMIT_EXCEEDED')) {
            errorMessage = "Gemini API rate limit exceeded. Please wait a few minutes before trying again, or check your API quota settings in Google Cloud Console.";
          } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage = "Invalid Gemini API key. Please check your API configuration.";
          } else if (error.message.includes('403') || error.message.includes('forbidden')) {
            errorMessage = "Access denied to Gemini API. Please check your API permissions.";
          }
        }
        
        return {
          blocks: [
            {
              title: "API Error",
              startLine: 1,
              endLine: 1,
              description: errorMessage
            }
          ]
        };
      }
    }
  }
  
  // This should never be reached, but just in case
  return {
    blocks: [
      {
        title: "Unexpected Error",
        startLine: 1,
        endLine: 1,
        description: "An unexpected error occurred. Please try again."
      }
    ]
  };
}

// No fallback mechanism - we only use Gemini API for code tour generation
