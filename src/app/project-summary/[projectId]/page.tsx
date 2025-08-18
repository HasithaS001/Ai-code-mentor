"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import ProjectSummary from '../../../components/ProjectSummary';

interface ProjectSummaryPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectSummaryPage({ params }: ProjectSummaryPageProps) {
  const { projectId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjectSummary = async () => {
      try {
        // In a real application, this would fetch from your backend API
        // For demo purposes, we'll create mock data
        const mockSummary = `
1. Project overview
This appears to be a React-based web application that implements a shopping cart functionality. The project uses modern JavaScript features and follows component-based architecture.

2. Detected dependencies
- React: ^18.2.0
- React DOM: ^18.2.0
- React Router: ^6.8.1
- Axios: ^1.3.2
- Tailwind CSS: ^3.2.6
- TypeScript: ^4.9.5

3. Tech stack
- Frontend: React with TypeScript
- Styling: Tailwind CSS
- State Management: React Context API
- Routing: React Router
- API Communication: Axios
- Build Tool: Vite
`;

        // Simulate API delay
        setTimeout(() => {
          setSummary(mockSummary);
          setLoading(false);
        }, 1000);
      } catch (err: any) {
        console.error('Error fetching project summary:', err);
        setError(err.message || 'Failed to fetch project summary');
        setLoading(false);
      }
    };

    fetchProjectSummary();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Analyzing project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header projectId={projectId} />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header projectId={projectId} />
      <div className="container mx-auto px-4 py-12">
        <ProjectSummary projectId={projectId} summary={summary} />
      </div>
    </div>
  );
}
