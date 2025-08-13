"use client";

import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from "react-icons/fa";
import FlowerConfetti from "./FlowerConfetti";

// Add this type definition if it's not globally available
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
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

export default function ChatInterface({
  projectId,
  selectedFile,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI coding mentor. Ask me any questions about this project or specific code snippets.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizMode, setShowQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null); // Ref to hold the recognition instance

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    setMicrophoneError(null);
    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      setMicrophoneError("Your browser doesn't support speech recognition.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "audio-capture") {
        setMicrophoneError(
          "Couldn't access microphone. Please check your permissions."
        );
      } else if (event.error === "not-allowed") {
        setMicrophoneError(
          "Microphone access was denied. Please allow microphone access in your browser settings."
        );
      } else {
        setMicrophoneError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const [quizError, setQuizError] = useState<string | null>(null);

  useEffect(() => {
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizError(null);
    setIsGeneratingQuiz(false);
    setQuizCompleted(false);
    setCorrectAnswers(0);
    setShowConfetti(false);

    if (showQuizMode && selectedFile) {
      console.log("File changed, resetting quiz for:", selectedFile.name);
    }
  }, [selectedFile?.path, showQuizMode]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    stopListening();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, message: input }),
      });
      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!selectedFile) return;
    setIsGeneratingQuiz(true);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizError(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selectedFile.content,
          language: selectedFile.language,
          difficulty: "beginner",
          questionCount: 10,
          fullFileAnalysis: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.error || "Failed to generate quiz";
        const errorDetails = data.details ? `: ${data.details}` : "";
        throw new Error(`${errorMessage}${errorDetails}`);
      }
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No quiz questions were generated. Please try again.");
      }
      setQuizQuestions(data.questions);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setQuizError(
        error instanceof Error ? error.message : "Failed to generate quiz"
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const calculateQuizResults = () => {
    let correct = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    setCorrectAnswers(correct);
    setQuizCompleted(true);
    if (correct > quizQuestions.length * 0.8) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowExplanation(false);
    } else if (
      currentQuestionIndex === quizQuestions.length - 1 &&
      !quizCompleted
    ) {
      calculateQuizResults();
    }
  };

  useEffect(() => {
    if (
      currentQuestionIndex === quizQuestions.length - 1 &&
      showExplanation &&
      selectedAnswers[currentQuestionIndex] !== undefined &&
      !quizCompleted
    ) {
      const timer = setTimeout(() => calculateQuizResults(), 1500);
      return () => clearTimeout(timer);
    }
  }, [
    currentQuestionIndex,
    showExplanation,
    selectedAnswers,
    quizQuestions.length,
    quizCompleted,
    calculateQuizResults,
  ]);

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const isAnswerCorrect = (questionIndex: number) => {
    return (
      selectedAnswers[questionIndex] ===
      quizQuestions[questionIndex]?.correctAnswer
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 text-gray-300">
      <div className="p-3 border-b border-gray-700">
        <div className="flex flex-col space-y-2">
          <h2 className="text-lg font-semibold text-gray-200 text-center">
            AI MENTOR
          </h2>
          <div className="flex rounded-lg bg-gray-800 p-1">
            <button
              onClick={() => setShowQuizMode(false)}
              className={`flex-1 py-1.5 px-4 text-sm font-medium rounded-md transition-all ${
                !showQuizMode
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
              disabled={!selectedFile && showQuizMode}
            >
              Chat Mode
            </button>
            <button
              onClick={() => setShowQuizMode(true)}
              className={`flex-1 py-1.5 px-4 text-sm font-medium rounded-md transition-all ${
                showQuizMode
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
              disabled={!selectedFile}
              title={!selectedFile ? "Select a file first" : ""}
            >
              Quiz Mode
            </button>
          </div>
          <p className="text-xs text-gray-400 pb-1">
            {showQuizMode
              ? "Test your knowledge with quizzes based on this code"
              : "Ask questions about your code or project"}
          </p>
        </div>
      </div>
      {showQuizMode ? (
        <div className="flex-1 overflow-y-auto p-4 font-lato">
          {selectedFile ? (
            isGeneratingQuiz ? (
              <div className="flex flex-col items-center justify-center h-full">
                <FaSpinner className="animate-spin text-teal-500 text-2xl mb-4" />
                <p className="text-gray-300 mb-4" style={{ fontSize: "16px" }}>
                  Generating quiz questions...
                </p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-3">
                <FlowerConfetti active={showConfetti} />
                {quizCompleted ? (
                  <div
                    className={`p-6 bg-gray-800 rounded-lg shadow-lg border-2 ${
                      correctAnswers < 5
                        ? "border-red-500"
                        : correctAnswers <= 8
                        ? "border-teal-500"
                        : "border-green-500"
                    } text-center`}
                  >
                    <h3 className="text-xl font-bold mb-4 text-gray-200">
                      Quiz Results
                    </h3>
                    <div className="text-5xl font-bold mb-6 text-teal-400">
                      {correctAnswers}/{quizQuestions.length}
                    </div>
                    <div className="mb-6">
                      {correctAnswers < quizQuestions.length / 2 ? (
                        <div className="p-4 bg-gray-900 rounded-lg text-gray-300 border border-red-500">
                          <p className="text-lg font-medium">
                            Study the code again.
                          </p>
                          <p className="text-sm mt-2">
                            You might need to review the concepts in this file
                            more carefully.
                          </p>
                        </div>
                      ) : correctAnswers <= quizQuestions.length * 0.8 ? (
                        <div className="p-4 bg-gray-900 rounded-lg text-gray-300 border border-teal-500">
                          <p className="text-lg font-medium">
                            Okay, it would be better if you study the code file
                            again.
                          </p>
                          <p className="text-sm mt-2">
                            You're on the right track, but there's room for
                            improvement.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-900 rounded-lg text-gray-300 border border-green-500">
                          <p className="text-lg font-medium">
                            Congrats, you have understood the code file well!
                          </p>
                          <p className="text-sm mt-2">
                            Excellent work! You have a solid understanding of
                            this code.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          setQuizCompleted(false);
                          setCurrentQuestionIndex(0);
                        }}
                        className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        Review Questions
                      </button>
                      <button
                        onClick={generateQuiz}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        New Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-800 text-teal-300 font-semibold text-sm">
                          {currentQuestionIndex + 1}
                        </span>
                        <span className="text-xs font-medium text-gray-400 ml-2">
                          of {quizQuestions.length} questions
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-teal-400 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium text-gray-400">
                          {selectedFile?.name}
                        </span>
                      </div>
                    </div>
                    <h3
                      className="font-semibold text-gray-200 mb-5 leading-tight"
                      style={{ fontSize: "16px" }}
                    >
                      {quizQuestions[currentQuestionIndex]?.question}
                    </h3>
                    <div className="space-y-3">
                      {quizQuestions[currentQuestionIndex]?.options.map(
                        (option: string, index: number) => {
                          const isSelected =
                            selectedAnswers[currentQuestionIndex] === index;
                          const isCorrect =
                            index ===
                            quizQuestions[currentQuestionIndex]?.correctAnswer;
                          return (
                            <button
                              key={index}
                              onClick={() =>
                                handleAnswerSelect(currentQuestionIndex, index)
                              }
                              className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ${
                                isSelected
                                  ? showExplanation
                                    ? isCorrect
                                      ? "border-green-500 bg-green-900/40"
                                      : "border-red-500 bg-red-900/40"
                                    : "border-teal-500 bg-teal-900/50"
                                  : "border-gray-600 hover:border-teal-500 bg-gray-900"
                              }`}
                              disabled={showExplanation}
                            >
                              <div className="flex items-center">
                                <span
                                  className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 font-medium ${
                                    isSelected
                                      ? "bg-teal-600 text-white"
                                      : "bg-gray-700 text-gray-300"
                                  }`}
                                >
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span
                                  className="text-gray-300"
                                  style={{ fontSize: "16px" }}
                                >
                                  {option}
                                </span>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                    {showExplanation && (
                      <div
                        className={`mt-6 p-5 rounded-lg ${
                          isAnswerCorrect(currentQuestionIndex)
                            ? "bg-green-900/40 border border-green-700"
                            : "bg-red-900/40 border border-red-700"
                        }`}
                      >
                        <h4
                          className={`font-semibold mb-2 text-lg ${
                            isAnswerCorrect(currentQuestionIndex)
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {isAnswerCorrect(currentQuestionIndex)
                            ? "Correct!"
                            : "Incorrect"}
                        </h4>
                        <p
                          className="text-gray-300"
                          style={{ fontSize: "16px" }}
                        >
                          {quizQuestions[currentQuestionIndex]?.explanation}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-5 py-2.5 border border-gray-600 rounded-lg text-gray-300 font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>
                      {selectedAnswers[currentQuestionIndex] !== undefined &&
                      !showExplanation ? (
                        <button
                          onClick={() => setShowExplanation(true)}
                          className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center"
                        >
                          Check Answer
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          disabled={!showExplanation}
                          className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {currentQuestionIndex === quizQuestions.length - 1
                            ? "Show Results"
                            : "Next Question"}
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
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
                    <p
                      className="text-red-400 mb-2"
                      style={{ fontSize: "16px" }}
                    >
                      Error: {quizError}
                    </p>
                    <p
                      className="text-gray-300 mb-4"
                      style={{ fontSize: "16px" }}
                    >
                      Please try again or select a different file.
                    </p>
                  </div>
                ) : (
                  <p
                    className="text-gray-300 mb-4"
                    style={{ fontSize: "16px" }}
                  >
                    No quiz questions generated yet.
                  </p>
                )}
                <button
                  onClick={generateQuiz}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all shadow-lg flex items-center justify-center gap-2 font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Generate Quiz for {selectedFile.name}
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400" style={{ fontSize: "16px" }}>
                Select a file to generate quiz questions.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 p-4 space-y-4 font-lato overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === "assistant" ? (
                      <img
                        src="/code.jpg"
                        alt="AI"
                        className="w-5 h-5 mr-2 rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="mr-2 text-white" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4 flex items-center text-gray-400">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-700">
            {microphoneError && (
              <div className="mb-2 p-2 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-xs font-lato">
                <p>{microphoneError}</p>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-200 placeholder-gray-400 font-lato text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="flex ml-2 shrink-0">
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-2 rounded-lg mr-2 ${
                    isLoading
                      ? "bg-gray-600 cursor-not-allowed"
                      : isListening
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-teal-600 hover:bg-teal-700"
                  } text-white`}
                  disabled={isLoading}
                >
                  {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg ${
                    !input.trim() || isLoading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  } text-white`}
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
