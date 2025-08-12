import Header from "../../components/Header";
import { FaRocket, FaLightbulb, FaCode, FaVolumeUp } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">About Code Mentor</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Code Mentor is a modern SaaS application designed to help developers learn and understand code faster through AI-powered explanations and voice narration.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              Our mission is to make code learning more accessible and intuitive by combining the power of AI with voice technology. 
              We believe that understanding code should be as simple as having a conversation with a mentor.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
                    <FaCode />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Upload Your Project</h3>
                </div>
                <p className="text-gray-600">
                  Start by uploading your project as a ZIP file or by providing a Git repository URL. Our system will analyze your codebase and provide a comprehensive summary.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
                    <FaLightbulb />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Select Code Snippets</h3>
                </div>
                <p className="text-gray-600">
                  In our interactive code editor, highlight any code snippet you want to understand better. A tooltip will appear allowing you to request an explanation.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                    <FaVolumeUp />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Listen to Explanations</h3>
                </div>
                <p className="text-gray-600">
                  Get clear, conversational explanations of your code with automatic voice narration powered by Google Cloud Text-to-Speech technology.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 text-red-600 p-3 rounded-full mr-4">
                    <FaRocket />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Learn and Improve</h3>
                </div>
                <p className="text-gray-600">
                  Use the AI chat interface to ask follow-up questions about your code and deepen your understanding. Our AI mentor is always ready to help.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Technology Stack</h2>
            <p className="text-gray-700 mb-4">
              Code Mentor is built using cutting-edge technologies:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Next.js for the frontend and API routes</li>
              <li>Google Gemini AI for code analysis and explanations</li>
              <li>Google Cloud Text-to-Speech for voice narration</li>
              <li>Monaco Editor for the code editing experience</li>
              <li>Tailwind CSS for modern, responsive design</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Get Started Today</h2>
            <p className="text-gray-700 mb-6">
              Ready to enhance your coding journey? Upload your project now and experience the power of AI-assisted code learning.
            </p>
            
            <div className="mt-8">
              <a 
                href="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Code Mentor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
