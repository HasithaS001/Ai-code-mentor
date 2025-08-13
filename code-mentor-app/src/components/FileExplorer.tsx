"use client";

import { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown, FaGraduationCap, FaCode } from 'react-icons/fa';
import { shouldFilterInBeginnerMode } from '../utils/beginnerLensFilters';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  onSelectFile: (file: { name: string; path: string }) => void;
}

const FileTreeNode = ({ 
  node, 
  depth = 0,
  onSelectFile 
}: { 
  node: FileNode; 
  depth?: number;
  onSelectFile: (file: { name: string; path: string }) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleSelectFile = () => {
    if (node.type === 'file') {
      onSelectFile({ name: node.name, path: node.path });
    }
  };
  
  return (
    <div>
      <div 
        className={`flex items-center group py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
          node.type === 'file' 
            ? 'hover:bg-teal-900/50'
            : 'hover:bg-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={node.type === 'file' ? handleSelectFile : handleToggle}
      >
        {node.type === 'directory' && (
          <button 
            onClick={handleToggle}
            className="mr-2 text-gray-500 hover:text-teal-400 focus:outline-none transition-colors duration-200"
          >
            {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </button>
        )}
        
        <span className="mr-3 text-gray-500 group-hover:text-teal-400 transition-colors duration-200">
          {node.type === 'directory' 
            ? (isExpanded 
                ? <FaFolderOpen /> 
                : <FaFolder />)
            : <FaFile />
          }
        </span>
        
        <span className={`text-sm truncate ${node.type === 'file' ? 'text-gray-300 group-hover:text-teal-300' : 'font-medium text-gray-200'}`}>
          {node.name}
        </span>
      </div>
      
      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((childNode, index) => (
            <FileTreeNode 
              key={`${childNode.path}-${index}`}
              node={childNode}
              depth={depth + 1}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileExplorer({ files, onSelectFile }: FileExplorerProps) {
  const [beginnerLensActive, setBeginnerLensActive] = useState(false);
  
  // Deep clone the file tree to avoid modifying the original
  function deepCloneFileNodes(nodes: FileNode[]): FileNode[] {
    return nodes.map(node => {
      const clonedNode = { ...node };
      if (node.children) {
        clonedNode.children = deepCloneFileNodes(node.children);
      }
      return clonedNode;
    });
  }
  
  // Function to filter out files that should be hidden in beginner mode
  function filterFilesForBeginners(nodes: FileNode[]): FileNode[] {
    const clonedNodes = deepCloneFileNodes(nodes);
    
    return clonedNodes
      .map(node => {
        if (shouldFilterInBeginnerMode(node.path, node.type === 'directory')) {
          return null;
        }
        
        if (node.type === 'directory' && node.children && node.children.length > 0) {
          const filteredChildren = filterFilesForBeginners(node.children);
          if (filteredChildren.length === 0) {
            return null;
          }
          return { ...node, children: filteredChildren };
        }
        
        return node;
      })
      .filter((node): node is FileNode => node !== null);
  }

  const filteredFiles = beginnerLensActive ? filterFilesForBeginners(files) : files;

  return (
    <div className="h-full overflow-auto bg-gray-900 text-gray-300 rounded-4xl">

      <div className="p-4">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-gray-200 tracking-wide">
            Project Files
          </h2>
          
          <div className="flex items-center bg-gray-800 rounded-full shadow-lg px-3 py-2 group relative">
            {/* Enhanced Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
              <div className="flex items-center mb-2">
                <FaGraduationCap className="text-teal-400 mr-2" />
                <div className="font-semibold text-teal-400">Beginner Lens</div>
              </div>
              
              <p className="mb-2">Simplifies your project view by hiding technical files that beginners don't need to focus on.</p>
              
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="font-medium text-gray-200 mb-1">How it works:</div>
                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                  <li>Hides configuration files like package.json, tsconfig.json</li>
                  <li>Removes build folders like node_modules, dist, public</li>
                  <li>Filters out technical files like .env, .gitignore</li>
                </ul>
              </div>
              
              <div className="mt-2 text-teal-400 font-medium text-[10px] flex items-center">
                <div className="mr-1">💡</div> Click the toggle to switch between beginner and advanced views
              </div>
              
              <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800 border-r border-b border-gray-700"></div>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs font-medium mr-2 hidden sm:inline text-teal-400">
                {beginnerLensActive ? "Beginner" : "Advanced"}
              </span>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={beginnerLensActive}
                  onChange={() => setBeginnerLensActive(!beginnerLensActive)}
                />
                <div 
                  className={`
                    w-12 h-6 rounded-full peer 
                    peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500/50
                    peer-checked:after:translate-x-full 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:rounded-full after:shadow-md
                    after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out
                    ${beginnerLensActive 
                      ? 'bg-teal-600' 
                      : 'bg-gray-700'}
                  `}
                ></div>
                <span className="ml-2 flex items-center">
                  {beginnerLensActive 
                    ? <FaGraduationCap className="text-teal-400" title="Beginner Lens Active" /> 
                    : <FaCode className="text-gray-500" title="Advanced Mode Active" />}
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* File Tree */}
        <div className="mt-4">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((fileNode, index) => (
              <FileTreeNode 
                key={`${fileNode.path}-${index}`}
                node={fileNode}
                onSelectFile={onSelectFile}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 font-medium rounded-lg bg-gray-800">
              No files found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}