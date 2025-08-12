"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import FileExplorer from '../../../components/FileExplorer';
import CodeEditor from '../../../components/CodeEditor';
import ChatInterface from '../../../components/ChatInterface';

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
  type: 'file' | 'directory';
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
          throw new Error(errorData.error || 'Failed to fetch project files');
        }
        
        const data = await response.json();
        setProjectFiles(data.files);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project files:', error);
        setLoading(false);
      }
    };

    fetchProjectFiles();
  }, [projectId]);

  // Handle file selection
  const handleSelectFile = async (file: { name: string; path: string }) => {
    try {
      // Fetch real file content from the API
      const response = await fetch(`/api/file-content/${projectId}?path=${encodeURIComponent(file.path)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch file content');
      }
      
      const data = await response.json();
      setSelectedFile({
        name: data.name,
        path: data.path,
        content: data.content,
        language: data.language,
      });
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container bg-gray-50 font-inter">
      <Header projectId={projectId} />
      
      <div className="dashboard-content grid grid-cols-12 gap-4 p-4 w-full">
        {/* File Explorer */}
        <div className="col-span-2 scrollable-section bg-white rounded-xl shadow-soft">
          <FileExplorer 
            files={projectFiles} 
            onSelectFile={handleSelectFile} 
          />
        </div>
        
        {/* Code Editor */}
        <div className="col-span-7 bg-white rounded-xl shadow-soft overflow-hidden">
          {selectedFile ? (
            <CodeEditor file={selectedFile} />
          ) : (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center max-w-md px-8">
                {/* Modern Code Illustration */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-white rounded-2xl shadow-soft-lg transform -rotate-2"></div>
                    <div className="absolute inset-0 bg-white rounded-2xl shadow-soft transform rotate-1">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                          <div className="h-3 bg-primary-light rounded-full w-1/2"></div>
                          <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
                          <div className="h-3 bg-primary-light rounded-full w-2/3"></div>
                          <div className="h-3 bg-gray-100 rounded-full w-3/5"></div>
                          <div className="h-3 bg-primary-light rounded-full w-4/5"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Select a file to view</h3>
                <p className="text-gray-500 text-lg">
                  Choose a file from the explorer to view and analyze its code with AI-powered explanations.  
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Interface */}
        <div className="col-span-3 scrollable-section bg-white rounded-xl shadow-soft">
          <ChatInterface projectId={projectId} selectedFile={selectedFile} />
        </div>
      </div>
    </div>
  );
}
