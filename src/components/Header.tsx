"use client";

import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaUserCircle, FaInfoCircle, FaCog } from "react-icons/fa";
import { useState } from "react";
import SettingsButton from "./SettingsButton";

interface HeaderProps {
  projectId?: string;
}

export default function Header({ projectId = "CM-2025" }: HeaderProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="backdrop-blur-md sticky top-0 z-50 border-b border-gray-700/50 h-16">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        {/* App Logo and Name with Project ID */}
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
              <span className="font-bold text-gray-200 text-xl font-inter">
                Code Mentor
              </span>
              {projectId && (
                <span className="text-xs text-gray-400 font-inter tracking-wide">
                  Project ID: {projectId}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-5">
          <a
            href="https://github.com/HasithaS001/code-be"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-teal-400 transition-all duration-300 p-2 rounded-full hover:bg-gray-700"
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
            className="text-gray-400 hover:text-teal-400 transition-all duration-300 p-2 rounded-full hover:bg-gray-700"
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

          {/* Settings Button - Note: The internal styling of this component is not modified */}
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}
