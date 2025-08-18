"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCode, FaBoxOpen, FaLayerGroup, FaRocket } from 'react-icons/fa';

interface ProjectSummaryProps {
  projectId: string;
  summary: string;
}

export default function ProjectSummary({ projectId, summary }: ProjectSummaryProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse the summary into sections
  const sections = {
    overview: summary.split('1. Project overview')[1]?.split('2.')[0] || 'Project overview not available',
    dependencies: summary.split('2. Detected dependencies')[1]?.split('3.')[0] || 'Dependencies not detected',
    techStack: summary.split('3. Tech stack')[1] || 'Tech stack not detected',
  };

  const handleLearnWithAI = () => {
    setIsLoading(true);
    router.push(`/dashboard/${projectId}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Project Summary</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Analysis Complete
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-2">
              <FaCode className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Project Overview</h3>
            </div>
            <p className="text-gray-600 pl-6">
              {sections.overview.trim()}
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <FaBoxOpen className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Detected Dependencies</h3>
            </div>
            <p className="text-gray-600 pl-6">
              {sections.dependencies.trim()}
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <FaLayerGroup className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Tech Stack</h3>
            </div>
            <p className="text-gray-600 pl-6">
              {sections.techStack.trim()}
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleLearnWithAI}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <FaRocket className="mr-2" /> Learn with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
