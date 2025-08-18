"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaGithub, FaSpinner } from 'react-icons/fa';

export default function ProjectUpload() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'zip' | 'git'>('zip');
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
    },
    maxFiles: 1,
    disabled: isUploading || uploadType === 'git',
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      await handleZipUpload(acceptedFiles[0]);
    },
  });

  const handleZipUpload = async (file: File) => {
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('uploadType', 'zip');
      formData.append('file', file);
      
      const response = await fetch('/api/upload-project', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload project');
      }
      
      const data = await response.json();
      router.push(`/dashboard/${data.projectId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload project');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Repository URL is required');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('uploadType', 'git');
      formData.append('repoUrl', repoUrl);
      
      const response = await fetch('/api/upload-project', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clone repository');
      }
      
      const data = await response.json();
      router.push(`/dashboard/${data.projectId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to clone repository');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-xl">
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              uploadType === 'zip' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setUploadType('zip')}
            disabled={isUploading}
          >
            Upload ZIP File
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              uploadType === 'git' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setUploadType('git')}
            disabled={isUploading}
          >
            Clone Git Repository
          </button>
        </div>
      </div>
      
      {uploadType === 'zip' ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">
            {isDragActive
              ? 'Drop the ZIP file here'
              : 'Drag & drop a ZIP file here, or click to select'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Upload your project as a ZIP file (max 50MB)
          </p>
        </div>
      ) : (
        <form onSubmit={handleGitSubmit} className="space-y-4">
          <div>
            <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Git Repository URL
            </label>
            <div className="flex">
              <div className="flex-shrink-0 inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <FaGithub />
              </div>
              <input
                type="text"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository.git"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                disabled={isUploading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Cloning Repository...
              </>
            ) : (
              'Clone Repository'
            )}
          </button>
        </form>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isUploading && uploadType === 'zip' && (
        <div className="mt-4 flex items-center justify-center">
          <FaSpinner className="animate-spin mr-2 text-blue-600" />
          <span className="text-gray-700">Uploading project...</span>
        </div>
      )}
    </div>
  );
}
