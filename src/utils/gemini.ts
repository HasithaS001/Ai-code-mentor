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
