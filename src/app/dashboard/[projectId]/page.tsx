"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import FileExplorer from "../../../components/FileExplorer";
import CodeEditor from "../../../components/CodeEditor";
import ChatInterface from "../../../components/ChatInterface";

interface DashboardPageProps {
  params: {
    projectId: string;
  };
}

// Define the params type for TypeScript
type Params = {
  projectId: string;
};

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export default function DashboardPage({ params }: DashboardPageProps) {
  // Cast params to the correct type to avoid TypeScript errors
  const { projectId } = params as Params;
  const [loading, setLoading] = useState(true);
  const [projectFiles, setProjectFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    path: string;
    content: string;
    language: string;
  } | null>(null);

  // Fetch project files
  useEffect(() => {
    const fetchProjectFiles = async () => {
      try {
        // Fetch real project files from the API
        const response = await fetch(`/api/project-files/${projectId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch project files");
        }

        const data = await response.json();
        setProjectFiles(data.files);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project files:", error);
        setLoading(false);
      }
    };

    fetchProjectFiles();
  }, [projectId]);

  // Handle file selection
  const handleSelectFile = async (file: { name: string; path: string }) => {
    try {
      // Fetch real file content from the API
      const response = await fetch(
        `/api/file-content/${projectId}?path=${encodeURIComponent(file.path)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch file content");
      }

      const data = await response.json();
      setSelectedFile({
        name: data.name,
        path: data.path,
        content: data.content,
        language: data.language,
      });
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#005f5a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-200">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-container font-inter bg-gradient-to-br from-[#000000] via-[#0b0f13] to-[#18232e]"
    >
      <Header projectId={projectId} />

      <div className="dashboard-content grid grid-cols-12 gap-4 p-4 w-full">
        {/* File Explorer */}
        <div className="col-span-2 scrollable-section rounded-lg border border-gray-700/50">
          <FileExplorer files={projectFiles} onSelectFile={handleSelectFile} />
        </div>

        {/* Code Editor */}
        <div className="col-span-7 bg-black/20 backdrop-blur-sm rounded-lg  border border-gray-700/50 overflow-hidden">
          {selectedFile ? (
            <CodeEditor file={selectedFile} />
          ) : (
            <div className="h-full flex items-center justify-center rounded-lg text-gray-300">
              <div className="text-center max-w-md px-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-48 h-48">
                    {/* AI Brain Core */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-teal-600/30 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-teal-500/30 to-teal-700/40 rounded-full"></div>
                    <div className="absolute inset-8 bg-gradient-to-br from-teal-600/40 to-teal-800/50 rounded-full"></div>
                    
                    {/* Central AI Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center shadow-2xl">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Floating Code Elements */}
                    <div className="absolute top-4 left-8 w-8 h-8 bg-teal-400/20 rounded-lg flex items-center justify-center animate-bounce">
                      <span className="text-teal-400 text-xs font-mono">&lt;/&gt;</span>
                    </div>
                    <div className="absolute top-12 right-6 w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.5s'}}>
                      <span className="text-teal-500 text-xs">AI</span>
                    </div>
                    <div className="absolute bottom-8 left-6 w-10 h-6 bg-teal-300/20 rounded-md flex items-center justify-center animate-bounce" style={{animationDelay: '1s'}}>
                      <span className="text-teal-300 text-xs font-mono">{ }</span>
                    </div>
                    <div className="absolute bottom-4 right-8 w-7 h-7 bg-teal-600/20 rounded-lg flex items-center justify-center animate-bounce" style={{animationDelay: '1.5s'}}>
                      <span className="text-teal-600 text-xs">★</span>
                    </div>
                    
                    {/* Connection Lines */}
                    <div className="absolute inset-0">
                      <svg className="w-full h-full opacity-30" viewBox="0 0 192 192">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        <path d="M96 96 L32 48 M96 96 L160 48 M96 96 L32 144 M96 96 L160 144" 
                              stroke="url(#lineGradient)" 
                              strokeWidth="1" 
                              fill="none"
                              className="animate-pulse"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-4">
                  Select a file to view
                </h3>
                <p className="text-gray-400 text-lg">
                  Choose a file from the explorer to view and analyze its code
                  with AI-powered explanations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="col-span-3 scrollable-section bg-black/20 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
          <ChatInterface projectId={projectId} selectedFile={selectedFile} />
        </div>
      </div>
    </div>
  );
}
