"use client";

import { useRef, useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import Editor, { Monaco } from "@monaco-editor/react";
import { translateText } from "../utils/translation";
import Image from "next/image";
import {
  FaVolumeUp,
  FaSpinner,
  FaProjectDiagram,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import VisualExplanation from "./VisualExplanation";
import {
  textToSpeech,
  stopAudio,
  getCurrentAudioElement,
  isGeneratingAudio,
  getAudioFromCache,
} from "../utils/tts";

interface CodeEditorProps {
  file: {
    name: string;
    content: string;
    language: string;
  };
}

export default function CodeEditor({ file }: CodeEditorProps) {
  // Get settings for voice and language
  const { settings } = useSettings();
  const editorRef = useRef<any>(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [translatedExplanation, setTranslatedExplanation] = useState<
    string | null
  >(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "visual" | "voice">(
    "text"
  );
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [currentContent, setCurrentContent] = useState(file.content);
  const [currentLanguage, setCurrentLanguage] = useState(file.language);
  const [panelHeight, setPanelHeight] = useState<number>(250); // Default height in pixels
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [speechProgress, setSpeechProgress] = useState<number>(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isUsingCachedExplanation, setIsUsingCachedExplanation] =
    useState<boolean>(false);
  const [isUsingCachedAudio, setIsUsingCachedAudio] = useState<boolean>(false);
  const resizingRef = useRef<{ startY: number; startHeight: number } | null>(
    null
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const defaultPanelHeight = 250;
  const expandedPanelHeight = 500;

  // Function to generate a unique key for the code explanation cache
  const generateCacheKey = (code: string, language: string): string => {
    // Simple hash function for the code content
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `code_explanation_${language}_${hash}`;
  };

  // Function to save explanation to local storage
  const saveExplanationToCache = (
    code: string,
    language: string,
    explanation: string
  ): void => {
    try {
      const cacheKey = generateCacheKey(code, language);
      const cacheData = {
        code,
        language,
        explanation,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log("Explanation saved to cache:", cacheKey);
    } catch (error) {
      console.error("Error saving explanation to cache:", error);
    }
  };

  // Function to get explanation from cache
  const getExplanationFromCache = (
    code: string,
    language: string
  ): string | null => {
    try {
      // Generate a simple hash key for the code and language
      const cacheKey = generateCacheKey(code, language);
      const cachedData = localStorage.getItem(cacheKey);

      if (!cachedData) {
        return null;
      }

      const parsedData = JSON.parse(cachedData);

      // Check if the cached code matches exactly
      if (parsedData.code === code && parsedData.language === language) {
        console.log("Using cached explanation");
        return parsedData.explanation;
      }

      return null;
    } catch (error) {
      console.error("Error retrieving explanation from cache:", error);
      return null;
    }
  };

  // Function to clear all cached data (both explanations and audio)
  const clearAllCaches = () => {
    try {
      // Clear explanation cache
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("code_explanation_") ||
            key.startsWith("elevenlabs_audio_cache_"))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} cached items`);

      // Reset states
      setIsUsingCachedExplanation(false);
      setIsUsingCachedAudio(false);

      return keysToRemove.length;
    } catch (error) {
      console.error("Error clearing caches:", error);
      return 0;
    }
  };

  // Update editor when file changes
  useEffect(() => {
    setCurrentContent(file.content);
    setCurrentLanguage(file.language);
    setSelectedCode("");
    setSelectionPosition(null);
    setExplanation(null);
    setActiveTab("text");

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [file]);

  // Handle editor mount and define custom theme
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Define a custom dark theme
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#010105",
        "editorGutter.background": "#010105",
      },
    });
    monaco.editor.setTheme("custom-dark");

    // Listen for selection changes
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel().getValueInRange(e.selection);

      if (selection && selection.trim().length > 0) {
        // Check if this is a new selection
        if (selection !== selectedCode) {
          // Reset explanation state for new selections
          setExplanation(null);
          setTranslatedExplanation(null);
          setIsExplaining(false);
          setIsPlaying(false);
          stopAudio(); // Stop any playing audio
        }

        setSelectedCode(selection);

        // Get position for tooltip
        const domNode = editor.getDomNode();
        if (domNode) {
          const editorCoords = domNode.getBoundingClientRect();
          const lineHeight = editor.getOption(
            monaco.editor.EditorOption.lineHeight
          );
          const { startLineNumber, startColumn } = e.selection;
          const position = editor.getScrolledVisiblePosition({
            lineNumber: startLineNumber,
            column: startColumn,
          });

          if (position) {
            setSelectionPosition({
              x: editorCoords.left + position.left,
              y: editorCoords.top + position.top + lineHeight,
            });
          }
        }
      } else {
        setSelectedCode("");
        setSelectionPosition(null);
      }
    });
  };

  // Get language from file extension
  const getLanguage = () => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };

    return languageMap[ext || ""] || "plaintext";
  };

  // Handle explain button click
  const handleExplain = async () => {
    if (!selectedCode || isExplaining) return;

    setIsExplaining(true);
    setHasPlayedOnce(false); // Reset the played once flag for new explanations
    setActiveTab("voice"); // Default to voice tab instead of text tab

    try {
      // Check if we have a cached explanation for this code
      const cachedExplanation = getExplanationFromCache(
        selectedCode,
        getLanguage()
      );

      if (cachedExplanation) {
        // Use cached explanation
        console.log("Using cached explanation");
        setIsUsingCachedExplanation(true);
        setExplanation(cachedExplanation);

        // Translate cached explanation if language is not English
        if (settings.language !== "en") {
          try {
            const translated = await translateText(
              cachedExplanation,
              settings.language
            );
            setTranslatedExplanation(translated);
          } catch (error) {
            console.error("Error translating cached explanation:", error);
            setTranslatedExplanation(cachedExplanation); // Fallback to original text
          }
        } else {
          setTranslatedExplanation(cachedExplanation);
        }
      } else {
        // No cached explanation, fetch from API
        setIsUsingCachedExplanation(false);
        setExplanation(null);

        const response = await fetch("/api/explain-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: selectedCode,
            language: getLanguage(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to explain code");
        }

        const data = await response.json();
        setExplanation(data.explanation);

        // Save the new explanation to cache
        saveExplanationToCache(selectedCode, getLanguage(), data.explanation);

        // Translate explanation if language is not English
        if (settings.language !== "en") {
          try {
            const translated = await translateText(
              data.explanation,
              settings.language
            );
            setTranslatedExplanation(translated);
          } catch (error) {
            console.error("Error translating explanation:", error);
            setTranslatedExplanation(data.explanation); // Fallback to original text
          }
        } else {
          setTranslatedExplanation(data.explanation);
        }
      }

      // Auto-play the explanation when it's ready
      try {
        setSpeechProgress(0);
        setIsLoadingAudio(true); // Set loading state when starting audio generation

        // Use the appropriate explanation text based on whether it's cached or new
        const explanationText =
          explanation ||
          (isUsingCachedExplanation ? cachedExplanation : "") ||
          "";

        // Check if we have cached audio for this explanation
        const translatedText =
          settings.language !== "en"
            ? translatedExplanation || ""
            : explanationText;
        const cachedAudio = getAudioFromCache(
          translatedText,
          settings.language
        );

        if (cachedAudio) {
          console.log("Using cached audio for explanation");
          setIsUsingCachedAudio(true);
        } else {
          console.log("No cached audio found, generating new audio");
          setIsUsingCachedAudio(false);
        }

        textToSpeech(explanationText, settings.language, {
          onProgress: (progress) => setSpeechProgress(progress),
          onComplete: () => {
            setSpeechProgress(100);
            setIsLoadingAudio(false); // Clear loading state when complete
            setTimeout(() => {
              setIsPlaying(false);
              setSpeechProgress(0);
            }, 500);
          },
          playbackSpeed: playbackSpeed,
        }).catch((err) => {
          console.error("Error playing speech:", err);
          setIsPlaying(false);
          setIsLoadingAudio(false); // Clear loading state on error
          setSpeechProgress(0);
        });
        setIsPlaying(true);
      } catch (error) {
        console.error("Error converting explanation to speech:", error);
        setIsPlaying(false);
        setIsLoadingAudio(false); // Clear loading state on error
        setSpeechProgress(0);
      }
    } catch (error) {
      console.error("Error explaining code:", error);
      setExplanation("Failed to explain code. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  const generateVisualExplanation = async () => {
    if (!selectedCode) return;

    setIsGeneratingVisual(true);

    try {
      // The actual API call is handled in the VisualExplanation component
      // This is just to simulate the loading state
      setTimeout(() => {
        setIsGeneratingVisual(false);
      }, 1000);
    } catch (error) {
      console.error("Error generating visual explanation:", error);
      setIsGeneratingVisual(false);
    }
  };

  // Effect to translate explanation when language changes
  useEffect(() => {
    const translateExplanation = async () => {
      if (explanation && settings.language !== "en") {
        try {
          const translated = await translateText(
            explanation,
            settings.language
          );
          setTranslatedExplanation(translated);
        } catch (error) {
          console.error(
            "Error translating explanation on language change:",
            error
          );
          setTranslatedExplanation(explanation); // Fallback to original text
        }
      } else if (explanation) {
        setTranslatedExplanation(explanation); // No translation needed for English
      }
    };

    translateExplanation();
  }, [settings.language, explanation]);

  // Handle speech synthesis initialization
  useEffect(() => {
    // Initialize speech synthesis voices when component mounts
    if ("speechSynthesis" in window) {
      // Force load voices
      window.speechSynthesis.getVoices();

      // Chrome needs this event to properly load voices
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded
        console.log("Speech synthesis voices loaded");
      };
    }

    return () => {
      // Cancel any ongoing speech when component unmounts
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizingRef.current) return;

      const dy = resizingRef.current.startY - e.clientY;
      const newHeight = Math.max(
        150,
        Math.min(600, resizingRef.current.startHeight + dy)
      );
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizingRef.current = null;
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizingRef.current = {
      startY: e.clientY,
      startHeight: panelHeight,
    };
  };

  // Toggle panel expansion
  const togglePanelExpansion = () => {
    const newExpandedState = !isPanelExpanded;
    setIsPanelExpanded(newExpandedState);
    setPanelHeight(newExpandedState ? expandedPanelHeight : defaultPanelHeight);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#010105] text-gray-300">
      {/* Adjust editor container height when explanation panel is visible */}
      <div
        className="relative flex-1 scrollable-section"
        style={{
          height: explanation ? `calc(100% - ${panelHeight}px)` : "100%",
          minHeight: 0,
        }}
      >
        <Editor
          height="100%"
          language={currentLanguage || getLanguage()}
          value={currentContent}
          theme="custom-dark" // Use the custom dark theme
          options={{
            readOnly: true,
            minimap: {
              enabled: true,
              maxColumn: 60,
              showSlider: "mouseover",
              renderCharacters: false,
              side: "right",
            },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: "on",
          }}
          onMount={handleEditorDidMount}
        />
      </div>

      {/* Selection tooltip */}
      {selectionPosition && selectedCode && (!explanation || isExplaining) && (
        <div
          className="absolute z-10"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: "translateY(8px)",
          }}
        >
          <button
            onClick={handleExplain}
            disabled={isExplaining}
            className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            {isExplaining ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 relative overflow-hidden rounded-full ring-2 ring-white/50 transform transition-transform group-hover:scale-110">
                  <Image
                    src="/code.jpg"
                    alt="Explain Code"
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="ml-2">Explain Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Explanation panel */}
      {explanation && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 shadow-2xl overflow-hidden flex flex-col z-20"
          style={{ height: `${panelHeight}px`, maxHeight: "60vh" }}
        >
          {/* Modern rounded arrow button in right corner */}
          <div
            className="absolute top-2 right-4 w-10 h-10 rounded-full bg-teal-600 shadow-md hover:shadow-lg flex justify-center items-center cursor-pointer transition-all duration-300 hover:bg-teal-700 z-10"
            onClick={togglePanelExpansion}
          >
            {isPanelExpanded ? (
              <FaChevronDown className="text-white" size={18} />
            ) : (
              <FaChevronUp className="text-white" size={18} />
            )}
          </div>

          {/* Content container */}
          <div className="overflow-auto flex-1 px-4">
            {/* Modern Tab Navigation */}
            <div
              className={`flex justify-center items-center ${
                isPanelExpanded ? "mb-3" : "mb-6"
              } px-4`}
            >
              <div className="flex items-center justify-between p-1 bg-gray-800 rounded-full relative">
                {/* Voice Tab */}
                <button
                  className={`px-4 py-1.5 rounded-full z-10 flex items-center justify-center transition-colors duration-300 ${
                    activeTab === "voice"
                      ? "text-teal-400 font-medium border-2 border-teal-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  style={{ width: "calc(33.33% - 4px)" }}
                  onClick={() => {
                    if (isPlaying) {
                      stopAudio();
                      setIsPlaying(false);
                    }
                    setActiveTab("voice");
                    if (explanation && !hasPlayedOnce && !isLoadingAudio) {
                      setSpeechProgress(0);
                      setIsLoadingAudio(true);
                      textToSpeech(explanation, settings.language, {
                        onProgress: (progress: number) =>
                          setSpeechProgress(progress),
                        onComplete: () => {
                          setSpeechProgress(100);
                          setIsLoadingAudio(false);
                          setTimeout(() => {
                            setIsPlaying(false);
                            setSpeechProgress(0);
                            setHasPlayedOnce(true);
                          }, 500);
                        },
                        playbackSpeed: playbackSpeed,
                      }).catch((err) => {
                        console.error("Error playing speech:", err);
                        setIsPlaying(false);
                        setIsLoadingAudio(false);
                        setSpeechProgress(0);
                      });
                      setIsPlaying(true);
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828-3.536-3.536 2.828-2.828m13.434 0l2.828 2.828-3.536 3.536-2.828-2.828"
                    />
                  </svg>
                  Voice
                </button>

                {/* Text Tab */}
                <button
                  className={`px-4 py-1.5 rounded-full z-10 flex items-center justify-center transition-colors duration-300 ${
                    activeTab === "text"
                      ? "text-teal-400 font-medium border-2 border-teal-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  style={{ width: "calc(33.33% - 4px)" }}
                  onClick={() => {
                    if (isPlaying) {
                      stopAudio();
                      setIsPlaying(false);
                    }
                    setActiveTab("text");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Text
                </button>

                {/* Visual Tab */}
                <button
                  className={`px-4 py-1.5 rounded-full z-10 flex items-center justify-center transition-colors duration-300 ${
                    activeTab === "visual"
                      ? "text-teal-400 font-medium border-2 border-teal-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  style={{ width: "calc(33.33% - 4px)" }}
                  onClick={() => {
                    if (isPlaying) {
                      stopAudio();
                      setIsPlaying(false);
                    }
                    setActiveTab("visual");
                    if (!isGeneratingVisual && selectedCode) {
                      generateVisualExplanation();
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  Visual
                </button>
              </div>
            </div>

            {activeTab === "text" ? (
              <div className="prose prose-sm max-w-none px-4 scrollable-section text-gray-300">
                {(translatedExplanation || explanation)
                  ?.split("\n")
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-2"
                      style={{ fontSize: "16px" }}
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : activeTab === "visual" ? (
              <div
                className={`h-full scrollable-section ${
                  isPanelExpanded ? "px-2" : "px-4"
                }`}
                style={{
                  minHeight: "200px",
                  height: isPanelExpanded ? `${panelHeight - 60}px` : "auto",
                }}
              >
                {isGeneratingVisual ? (
                  <div className="flex items-center justify-center h-full">
                    <FaSpinner
                      className="animate-spin text-teal-500"
                      size={24}
                    />
                    <span className="ml-2 text-gray-400">
                      Generating visual explanation...
                    </span>
                  </div>
                ) : (
                  <VisualExplanation
                    code={selectedCode}
                    language={currentLanguage || getLanguage()}
                    panelHeight={
                      isPanelExpanded ? panelHeight - 40 : panelHeight - 100
                    }
                  />
                )}
              </div>
            ) : (
              <div
                className="h-full flex items-center justify-center"
                style={{ minHeight: "150px" }}
              >
                <div className="flex flex-col items-center justify-center w-full max-w-md px-4">
                  {/* Modern progress bar */}
                  <div className="w-full mb-6">
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 ease-out"
                        style={{ width: `${speechProgress}%` }}
                      ></div>
                    </div>
                    {isPlaying && (
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                        <span>{Math.floor(speechProgress)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center space-x-8 mb-2">
                    {/* Play/Pause button */}
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          const currentAudio = getCurrentAudioElement();
                          if (currentAudio) {
                            currentAudio.pause();
                            setIsPlaying(false);
                          }
                        } else {
                          const currentAudio = getCurrentAudioElement();
                          if (
                            currentAudio &&
                            currentAudio.paused &&
                            currentAudio.duration > 0 &&
                            currentAudio.currentTime > 0
                          ) {
                            currentAudio.play();
                            setIsPlaying(true);
                          } else {
                            setSpeechProgress(0);
                            setIsLoadingAudio(true);
                            textToSpeech(explanation, settings.language, {
                              onProgress: (progress: number) => {
                                setSpeechProgress(progress);
                                if (isLoadingAudio && progress > 0) {
                                  setIsLoadingAudio(false);
                                }
                              },
                              onComplete: () => {
                                setSpeechProgress(100);
                                setIsLoadingAudio(false);
                                setTimeout(() => {
                                  setIsPlaying(false);
                                  setSpeechProgress(0);
                                }, 500);
                              },
                              playbackSpeed: playbackSpeed,
                            }).catch((err) => {
                              console.error("Error playing speech:", err);
                              setIsPlaying(false);
                              setIsLoadingAudio(false);
                              setSpeechProgress(0);
                            });
                            setIsPlaying(true);
                          }
                        }
                      }}
                      className="focus:outline-none relative text-teal-500"
                      disabled={isLoadingAudio || !explanation}
                    >
                      {isLoadingAudio && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-500 border-t-transparent"></div>
                        </div>
                      )}
                      <div
                        className={isLoadingAudio ? "opacity-0" : "opacity-100"}
                      >
                        {isPlaying ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5.14v14l11-7-11-7z" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Replay button */}
                    <button
                      onClick={() => {
                        if (!explanation) return;
                        stopAudio();
                        setSpeechProgress(0);
                        setIsLoadingAudio(true);
                        setIsPlaying(true);
                        setTimeout(() => {
                          textToSpeech(explanation, settings.language, {
                            onProgress: (progress: number) => {
                              setSpeechProgress(progress);
                              if (isLoadingAudio && progress > 0) {
                                setIsLoadingAudio(false);
                              }
                            },
                            onComplete: () => {
                              setSpeechProgress(100);
                              setIsLoadingAudio(false);
                              setTimeout(() => {
                                setIsPlaying(false);
                                setSpeechProgress(0);
                              }, 1000);
                            },
                            playbackSpeed: playbackSpeed,
                          }).catch((err) => {
                            console.error("Error playing speech:", err);
                            setIsPlaying(false);
                            setIsLoadingAudio(false);
                            setSpeechProgress(0);
                          });
                          setIsPlaying(true);
                        }, 100);
                      }}
                      className="focus:outline-none text-teal-500"
                      disabled={isLoadingAudio || !explanation}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                      </svg>
                    </button>

                    {/* Stop button */}
                    <button
                      onClick={() => {
                        const currentAudio = getCurrentAudioElement();
                        if (currentAudio) {
                          currentAudio.pause();
                          currentAudio.currentTime = 0;
                        }
                        stopAudio();
                        setIsPlaying(false);
                        setSpeechProgress(0);
                      }}
                      className="focus:outline-none text-teal-500"
                      disabled={
                        isLoadingAudio || (!isPlaying && speechProgress === 0)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 6h12v12H6z" />
                      </svg>
                    </button>
                  </div>

                  {/* Playback speed selector */}
                  <div className="relative">
                    <button
                      className="p-2 rounded-full text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      disabled={!explanation || isExplaining}
                      title="Change playback speed"
                    >
                      <span className="text-xs font-medium">
                        {playbackSpeed}x
                      </span>
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-full mb-2 bg-gray-800 border border-gray-700 shadow-lg rounded-md p-1 z-10">
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                          <button
                            key={speed}
                            className={`block w-full text-left px-3 py-1 text-sm rounded ${
                              playbackSpeed === speed
                                ? "bg-teal-800 text-white"
                                : "hover:bg-gray-700 text-gray-300"
                            }`}
                            onClick={() => {
                              setPlaybackSpeed(speed);
                              setShowSpeedMenu(false);
                              const currentAudio = getCurrentAudioElement();
                              if (isPlaying && currentAudio) {
                                currentAudio.playbackRate = speed;
                              }
                            }}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
