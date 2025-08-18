"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import ProjectUpload from "../components/ProjectUpload";
import SettingsButton from "../components/SettingsButton";
import {
  FaLightbulb,
  FaCode,
  FaVolumeUp,
  FaRocket,
  FaSpinner,
} from "react-icons/fa";

export default function Home() {
  const [activeTab, setActiveTab] = useState("file"); // "file" or "git"
  const [isUploading, setIsUploading] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check if file is a zip file
    if (!file.name.endsWith(".zip")) {
      setError("Only ZIP files are supported");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("uploadType", "zip");
      formData.append("file", file);

      const response = await fetch("/api/upload-project", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload project");
      }

      const data = await response.json();
      router.push(`/dashboard/${data.projectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to upload project");
      setIsUploading(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (isUploading || activeTab !== "file") return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [isUploading, activeTab, handleFileUpload]
  ); // Added handleFileUpload to dependency array

  // FIX: Added flex and flex-col to allow the container to grow and enable scrolling. Removed typo "rou".
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section with Integrated Header - Crystal Blur Effect */}
      <section className="relative text-center overflow-hidden">
        {/* Background Elements for Crystal Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#03958a]/20 to-white z-0"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#03958a]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-32 -right-24 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-2xl"></div>
        
        {/* Grid Lines Pattern - Positioned above blur effects and continues through header */}
        <div 
          className="absolute inset-0 z-5" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(156, 203, 197, 0.7) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(156, 203, 197, 0.7) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            opacity: 1,
            pointerEvents: 'none'
          }}>
        </div>
        
        {/* Content Container */}
        <div className="relative z-10">
        {/* Integrated Header - Transparent with no separate grid */}
        <header className="bg-transparent sticky top-0 z-50 h-16 relative overflow-hidden">
          <div className="container mx-auto px-6 h-full flex justify-between items-center">
            {/* App Logo and Name */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl shadow-lg overflow-hidden bg-teal-600 flex items-center justify-center text-white transition-all duration-300 group-hover:shadow-teal-500/20">
                  <Image
                    src="/code.jpg"
                    alt="CodeMentor Logo"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-xl font-inter">
                    Code Mentor
                  </span>
                  <span className="text-xs text-gray-600 font-inter tracking-wide">
                    AI-Powered Code Explanations
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-5">
              <a
                href="https://github.com/HasithaS001/code-be"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-[#03958a] transition-all duration-300 p-2 rounded-full hover:bg-white/30"
                aria-label="GitHub"
                title="GitHub Repository"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>

              <button
                className="text-gray-700 hover:text-[#03958a] transition-all duration-300 p-2 rounded-full hover:bg-white/30"
                aria-label="User Profile"
                title="User Profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              <SettingsButton />
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="container mx-auto px-4 max-w-4xl pt-24 pb-24">
          <h1 className="font-lato text-5xl md:text-6xl font-bold mb-8 leading-tight text-gray-900 tracking-tight">
            Master Code — Like You're Pairing with an{" "}
            <span className="font-inter text-[#03958a] font-extrabold underline decoration-[#03958a] decoration-2 underline-offset-4 italic">Expert Developer</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
            Learn any codebase step-by-step with AI voice, visuals, and interactive tours — as if an expert is coding right beside you.
          </p>
          <a
            href="#features"
            className="inline-block bg-[#03958a] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#027a6b] transition-colors text-center mt-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Learn More
          </a>
        </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-4">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-4 relative">
                <span className="text-2xl font-bold">1</span>
                <div className="absolute w-full h-full rounded-full border-2 border-blue-300 animate-ping opacity-20"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Upload Project
              </h3>
              <p className="text-gray-600">
                Upload your code files or connect your GitHub repository
              </p>
            </div>

            {/* Connector */}
            <div className="hidden md:block border-t-2 border-dashed border-gray-300 flex-grow mx-4 h-0"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Scan Project
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your code structure and identifies key
                components
              </p>
            </div>

            {/* Connector */}
            <div className="hidden md:block border-t-2 border-dashed border-gray-300 flex-grow mx-4 h-0"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Start Learning
              </h3>
              <p className="text-gray-600">
                Get AI-powered voice explanations and visual walkthroughs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Upload Section */}
      <section id="upload-section" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-6 relative z-10 border-2 border-dashed border-blue-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Upload Your Project
            </h2>

            {/* Toggle Switch */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-full flex items-center">
                <button
                  className={`px-4 py-2 rounded-full focus:outline-none transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "file"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("file")}
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>File Upload</span>
                </button>
                <button
                  className={`px-4 py-2 rounded-full focus:outline-none transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "git"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("git")}
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>Git Repository</span>
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`${
                activeTab === "file" ? "block" : "hidden"
              } border-2 border-dashed ${
                isDragging
                  ? "border-blue-600 bg-blue-100"
                  : "border-blue-500 bg-blue-50 hover:bg-blue-100"
              } rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer group mx-auto max-w-2xl h-64 ${
                isUploading ? "opacity-50 pointer-events-none" : ""
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <label
                htmlFor="file-upload"
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
                    <p className="text-blue-700 font-medium mb-2 text-lg">
                      Uploading Project...
                    </p>
                    <p className="text-gray-500 text-center">
                      Please wait while we process your file
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p className="text-blue-700 font-medium mb-2 text-lg">
                      {isDragging
                        ? "Drop Your ZIP File Here"
                        : "Drag & Drop Project Files Here"}
                    </p>
                    <p className="text-gray-500 text-center mb-4">
                      or click to browse your files
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports .zip files (Max: 50MB)
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Repository URL Input */}
            <div
              className={`${
                activeTab === "git" ? "block" : "hidden"
              } border-2 border-dashed border-blue-500 rounded-xl p-10 mx-auto max-w-2xl`}
            >
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 text-gray-700 p-4 rounded-full mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.839c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-6">
                  Enter GitHub Repository URL
                </h3>
                <input
                  type="text"
                  placeholder="https://github.com/username/repo"
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isUploading}
                />
                <button
                  className={`bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center ${
                    isUploading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={async () => {
                    if (!repoUrl.trim()) {
                      setError("Repository URL is required");
                      return;
                    }

                    setIsUploading(true);
                    setError("");

                    try {
                      const formData = new FormData();
                      formData.append("uploadType", "git");
                      formData.append("repoUrl", repoUrl);

                      const response = await fetch("/api/upload-project", {
                        method: "POST",
                        body: formData,
                      });

                      if (!response.ok) {
                        const data = await response.json();
                        throw new Error(
                          data.error || "Failed to clone repository"
                        );
                      }

                      const data = await response.json();
                      router.push(`/dashboard/${data.projectId}`);
                    } catch (err: any) {
                      setError(err.message || "Failed to clone repository");
                      setIsUploading(false);
                    }
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Cloning Repository...
                    </>
                  ) : (
                    "Import Repository"
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md max-w-2xl mx-auto">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get AI-powered explanations for any code snippet with voice
              narration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Upload Your Project
              </h3>
              <p className="text-gray-600">
                Upload a ZIP file or paste a Git repository URL to get started.
                We'll analyze your project structure and dependencies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 text-purple-600 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaLightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Select Code Snippets
              </h3>
              <p className="text-gray-600">
                Highlight any code snippet in the interactive editor. A tooltip
                will appear allowing you to request an explanation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaVolumeUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Listen to Explanations
              </h3>
              <p className="text-gray-600">
                Get clear, conversational explanations of your code with
                automatic voice narration powered by Google Cloud TTS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FIX: Removed the redundant second Upload Section that was here */}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 text-xl font-bold">
                <FaRocket className="text-blue-400" />
                <span>Code Mentor</span>
              </div>
              <p className="text-gray-400 mt-2">
                Learn code faster with AI-powered explanations
              </p>
            </div>

            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Code Mentor. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
