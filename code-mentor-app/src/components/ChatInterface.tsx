"use client";

import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from 'react-icons/fa';
import FlowerConfetti from './FlowerConfetti';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  projectId: string;
  selectedFile?: {
    name: string;
    path: string;
    content: string;
    language: string;
  } | null;
}

export default function ChatInterface({ projectId, selectedFile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI coding mentor. Ask me any questions about this project or specific code snippets.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizMode, setShowQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // State for microphone access error
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  
  // Initialize speech recognition
  const startListening = () => {
    // Reset any previous error
    setMicrophoneError(null);
    
    if (!isListening) {
      try {
        // Check if browser supports speech recognition
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
          setMicrophoneError("Your browser doesn't support speech recognition.");
          return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => {
              // Explicitly cast to SpeechRecognitionResult
              const speechResult = result as SpeechRecognitionResult;
              return speechResult[0];
            })
            .map(result => result.transcript)
            .join('');
          
          setInput(transcript);
        };
        
        recognition.onerror = (event) => {
          if (event.error === 'audio-capture') {
            setMicrophoneError("Couldn't access microphone. Please check your permissions.");
          } else if (event.error === 'not-allowed') {
            setMicrophoneError("Microphone access was denied. Please allow microphone access in your browser settings.");
          } else if (event.error === 'network') {
            setMicrophoneError("Network error occurred. Please check your connection.");
          } else {
            setMicrophoneError(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } catch (error) {
        console.error('Speech recognition error:', error);
        setMicrophoneError("Couldn't initialize speech recognition. Please try again.");
        setIsListening(false);
      }
    } else {
      stopListening();
    }
  };
  
  const stopListening = () => {
    setIsListening(false);
    try {
      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.stop();
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };
  
  // Reset quiz section when a new file is selected
  useEffect(() => {
    // Reset quiz state when file changes
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizError(null);
    setIsGeneratingQuiz(false);
    setQuizCompleted(false);
    setCorrectAnswers(0);
    setShowConfetti(false);
    
    // If user was in quiz mode, keep them there but with reset state
    if (showQuizMode && selectedFile) {
      console.log('File changed, resetting quiz for:', selectedFile.name);
    }
  }, [selectedFile?.path]); // Only trigger when the file path changes
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real application, this would call your backend API
      // that integrates with the Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          message: input,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // State for quiz error messages
  const [quizError, setQuizError] = useState<string | null>(null);

  // Function to generate quiz from selected file
  const generateQuiz = async () => {
    if (!selectedFile) return;
    
    setIsGeneratingQuiz(true);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizError(null);
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: selectedFile.content,
          language: selectedFile.language,
          difficulty: 'beginner',
          questionCount: 10, // Request at least 10 questions
          fullFileAnalysis: true // Analyze the entire file, not just snippets
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || 'Failed to generate quiz';
        const errorDetails = data.details ? `: ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No quiz questions were generated. Please try again.');
      }
      
      setQuizQuestions(data.questions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setQuizError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };
  
  // Calculate total score and display results
  const calculateQuizResults = () => {
    let correct = 0;
    Object.keys(selectedAnswers).forEach(questionIndex => {
      const index = parseInt(questionIndex);
      if (selectedAnswers[index] === quizQuestions[index]?.correctAnswer) {
        correct++;
      }
    });
    
    setCorrectAnswers(correct);
    setQuizCompleted(true);
    
    // Show confetti animation for good scores
    if (correct > quizQuestions.length * 0.8) { // > 80% correct
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds
    }
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else if (currentQuestionIndex === quizQuestions.length - 1 && !quizCompleted) {
      // Last question has been answered, calculate results
      calculateQuizResults();
    }
  };

  // Check if we should show the quiz results
  // This runs after the explanation is shown for the last question
  useEffect(() => {
    if (currentQuestionIndex === quizQuestions.length - 1 && 
        showExplanation && 
        selectedAnswers[currentQuestionIndex] !== undefined && 
        !quizCompleted) {
      // Add a small delay to allow the user to see the explanation first
      const timer = setTimeout(() => calculateQuizResults(), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, showExplanation, selectedAnswers, quizQuestions.length, quizCompleted]);
  
  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };
  
  // Check if selected answer is correct
  const isAnswerCorrect = (questionIndex: number) => {
    return selectedAnswers[questionIndex] === quizQuestions[questionIndex]?.correctAnswer;
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <div className="flex flex-col space-y-2">
          <h2 className="text-lg font-semibold text-gray-800 text-center">AI MENTOR</h2>
          
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setShowQuizMode(false)}
              className={`flex-1 py-1.5 px-4 text-sm font-medium rounded-md transition-all ${!showQuizMode 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'}`}
              disabled={!selectedFile && showQuizMode}
            >
              Chat Mode
            </button>
            <button
              onClick={() => setShowQuizMode(true)}
              className={`flex-1 py-1.5 px-4 text-sm font-medium rounded-md transition-all ${showQuizMode 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'}`}
              disabled={!selectedFile}
              title={!selectedFile ? 'Select a file first' : ''}
            >
              Quiz Mode
            </button>
          </div>
          
          <p className="text-xs text-gray-500 pb-1">
            {showQuizMode 
              ? 'Test your knowledge with quizzes based on this code' 
              : 'Ask questions about your code or project'}
          </p>
        </div>
      </div>
      {showQuizMode ? (
        <div className="flex-1 overflow-y-auto p-4 font-lato">
          {selectedFile ? (
            isGeneratingQuiz ? (
              <div className="flex flex-col items-center justify-center h-full">
                <FaSpinner className="animate-spin text-blue-600 text-2xl mb-4" />
                <p className="text-[#364153] mb-4" style={{ fontSize: '16px' }}>Generating quiz questions...</p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-3">
                {/* Flower confetti animation */}
                <FlowerConfetti active={showConfetti} />
                
                {quizCompleted ? (
                  <div className={`p-6 bg-white rounded-lg shadow-sm border-2 ${correctAnswers < 5 ? 'border-red-500' : correctAnswers <= 8 ? 'border-blue-500' : 'border-green-500'} text-center`}>
                    <h3 className="text-xl font-bold mb-4 text-black">Quiz Results</h3>
                    
                    <div className="text-5xl font-bold mb-6 text-blue-600">
                      {correctAnswers}/{quizQuestions.length}
                    </div>
                    
                    <div className="mb-6">
                      {correctAnswers < quizQuestions.length / 2 ? (
                        <div className="p-4 bg-white rounded-lg text-black border border-red-500">
                          <p className="text-lg font-medium">Study the code again.</p>
                          <p className="text-sm mt-2">You might need to review the concepts in this file more carefully.</p>
                        </div>
                      ) : correctAnswers <= quizQuestions.length * 0.8 ? (
                        <div className="p-4 bg-white rounded-lg text-black border border-blue-500">
                          <p className="text-lg font-medium">Okay, it would be better if you study the code file again.</p>
                          <p className="text-sm mt-2">You're on the right track, but there's room for improvement.</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-white rounded-lg text-black border border-green-500">
                          <p className="text-lg font-medium">Congrats, you have understood the code file well!</p>
                          <p className="text-sm mt-2">Excellent work! You have a solid understanding of this code.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          setQuizCompleted(false);
                          setCurrentQuestionIndex(0);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Review Questions
                      </button>
                      <button
                        onClick={() => {
                          setQuizQuestions([]);
                          setCurrentQuestionIndex(0);
                          setSelectedAnswers({});
                          setShowExplanation(false);
                          setQuizCompleted(false);
                          setCorrectAnswers(0);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        New Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {currentQuestionIndex + 1}
                        </span>
                        <span className="text-xs font-medium text-[#364153] ml-2">
                          of {quizQuestions.length} questions
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-[#364153]">
                          {selectedFile?.name}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-[#364153] mb-5 leading-tight" style={{ fontSize: '16px' }}>
                      {quizQuestions[currentQuestionIndex]?.question}
                    </h3>
                    
                    <div className="space-y-3">
                      {quizQuestions[currentQuestionIndex]?.options.map((option: string, index: number) => {
                        const isSelected = selectedAnswers[currentQuestionIndex] === index;
                        const isCorrect = index === quizQuestions[currentQuestionIndex]?.correctAnswer;
                        const showResult = showExplanation && isSelected;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                            className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ${isSelected
                              ? showExplanation
                                ? isCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 bg-white'
                            }`}
                            disabled={showExplanation}
                          >
                            <div className="flex items-center">
                              <span className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 font-medium ${isSelected
                                ? showExplanation
                                  ? isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-black'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-[#364153]" style={{ fontSize: '16px' }}>{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {showExplanation && (
                      <div className={`mt-6 p-5 rounded-lg ${isAnswerCorrect(currentQuestionIndex) ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <h4 className={`font-semibold mb-2 text-lg ${isAnswerCorrect(currentQuestionIndex) ? 'text-green-700' : 'text-red-700'}`}>
                          {isAnswerCorrect(currentQuestionIndex) ? 'Correct! ' : 'Incorrect'}
                        </h4>
                        <p className="text-[#364153]" style={{ fontSize: '16px' }}>
                          {quizQuestions[currentQuestionIndex]?.explanation}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-[#364153] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center" style={{ fontSize: '16px' }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      
                      {selectedAnswers[currentQuestionIndex] !== undefined && !showExplanation ? (
                        <button
                          onClick={() => setShowExplanation(true)}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                        >
                          Check Answer
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          disabled={!showExplanation}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {currentQuestionIndex === quizQuestions.length - 1 ? 'Show Results' : 'Next Question'}
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                {quizError ? (
                  <div className="text-center mb-6">
                    <p className="text-red-600 mb-2" style={{ fontSize: '16px' }}>Error: {quizError}</p>
                    <p className="text-[#364153] mb-4" style={{ fontSize: '16px' }}>Please try again or select a different file.</p>
                  </div>
                ) : (
                  <p className="text-[#364153] mb-4" style={{ fontSize: '16px' }}>No quiz questions generated yet.</p>
                )}
                <button
                  onClick={generateQuiz}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Generate Quiz for {selectedFile.name}
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-[#364153]" style={{ fontSize: '16px' }}>Select a file to generate quiz questions.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 p-4 space-y-4 font-lato overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === 'assistant' ? (
                      <img src="/code.jpg" alt="AI" className="w-5 h-5 mr-2 rounded-full object-cover" />
                    ) : (
                      <FaUser className="mr-2 text-white" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center text-gray-500">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200">
            {microphoneError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-lato">
                <p>{microphoneError}</p>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center">
              <div className="flex-1 max-w-[70%]">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black font-lato text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="flex ml-2 shrink-0">
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-2 rounded-lg mr-2 ${isLoading ? 'bg-gray-300 cursor-not-allowed' : isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  disabled={isLoading}
                >
                  {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg ${!input.trim() || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
