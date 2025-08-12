"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FaGithub, FaUserCircle, FaInfoCircle, FaCog } from 'react-icons/fa';
import { useState } from 'react';
import SettingsButton from './SettingsButton';

interface HeaderProps {
  projectId?: string;
}

export default function Header({ projectId = 'CM-2025' }: HeaderProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <header className="bg-white sticky top-0 z-50 shadow-soft h-16">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        {/* App Logo and Name with Project ID */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl shadow-soft overflow-hidden bg-primary flex items-center justify-center text-white transition-all duration-300 group-hover:shadow-soft-lg">
              <Image 
                src="/code.jpg" 
                alt="CodeMentor Logo" 
                width={40} 
                height={40} 
                className="object-cover opacity-0" 
              />
              <span className="absolute font-bold text-xl">CM</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-xl font-inter">Code Mentor</span>
              {projectId && (
                <span className="text-xs text-gray-500 font-inter tracking-wide">Project ID: {projectId}</span>
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
            className="text-gray-600 hover:text-primary transition-all-300 p-2 rounded-full hover:bg-gray-100"
            aria-label="GitHub"
            title="GitHub Repository"
          >
            <FaGithub className="text-xl" />
          </a>
          
          <button 
            className="text-gray-600 hover:text-primary transition-all-300 p-2 rounded-full hover:bg-gray-100"
            aria-label="User Profile"
            title="User Profile"
          >
            <FaUserCircle className="text-xl" />
          </button>
          
          {/* Settings Button */}
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}
