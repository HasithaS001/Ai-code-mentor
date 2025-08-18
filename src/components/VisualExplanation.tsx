"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

interface VisualExplanationProps {
  code: string;
  language: string;
  panelHeight?: number;
}

interface VisualData {
  nodes: Node[];
  edges: Edge[];
  title: string;
  description: string;
}

const VisualExplanation: React.FC<VisualExplanationProps> = ({ code, language, panelHeight = 300 }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [codeKey, setCodeKey] = useState<string>('');

  const generateVisualExplanation = useCallback(async () => {
    if (!code || !language) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-visual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate visual explanation');
      }
      
      const data: VisualData = await response.json();
      
      // Set the flow data
      setNodes(data.nodes);
      setEdges(data.edges);
      setTitle(data.title);
      setDescription(data.description);
    } catch (err) {
      console.error('Error generating visual explanation:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  useEffect(() => {
    // Only regenerate if code has changed
    const newCodeKey = `${code}-${language}`;
    if (newCodeKey !== codeKey) {
      setCodeKey(newCodeKey);
      generateVisualExplanation();
    }
  }, [code, language, codeKey, generateVisualExplanation]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-white" style={{ fontSize: '16px' }}>Generating visual explanation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 w-full max-w-lg">
          <p className="text-red-600" style={{ fontSize: '16px' }}>Error: {error}</p>
        </div>
        <button
          onClick={generateVisualExplanation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-white" style={{ fontSize: '16px' }}>{description}</p>
      </div>
      <div className="flex-1" style={{ height: `${panelHeight}px` }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default VisualExplanation;
