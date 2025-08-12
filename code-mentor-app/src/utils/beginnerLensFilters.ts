/**
 * Beginner Lens Filters
 * 
 * This file contains patterns for filtering out files that might be confusing or unnecessary
 * for beginners to see in the file explorer.
 */

// Directories to filter out
export const filteredDirectories = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.vscode',
  '__pycache__',
  '.venv',
  'env',
  'vendor',
  'storage',
  'bootstrap/cache',
  'target',
  'out',
  'bin',
  'obj',
  'migrations',
  '.pytest_cache',
  '.idea',
  'public',  // Added public folder as requested
];

// Files to filter out
export const filteredFiles = [
  'package-lock.json',
  'yarn.lock',
  '.env',
  '.eslintrc',
  '.prettierrc',
  'babel.config.js',
  'webpack.config.js',
  'rollup.config.js',
  'tsconfig.json',
  'jest.config.js',
  '.gitignore',
  'LICENSE',
  '.DS_Store',
  'Thumbs.db',
  'composer.lock',
  '.project',
  '.classpath',
  'README.md',
  'build_output.txt',
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
  'next.config.cjs',
  'tsconfig.json',
  'postcss.config.js',
  'postcss.config.mjs',
  'postcss.config.cjs',
  'tailwind.config.js',
  'tailwind.config.ts',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
  'vercel.json',
  'eslint.config.js',
  'eslint.config.ts',
  'eslint.config.mjs',
  'eslint.config.cjs',
];

// File extensions to filter out
export const filteredExtensions = [
  '.min.js',
  '.map',
  '.pyc',
  '.pyo',
  '.pyd',
  '.class',
  '.jar',
  '.war',
  '.dll',
  '.exe',
  '.pdb',
  '.user',
  '.suo',
  '.log',
];

/**
 * Checks if a file or directory should be filtered out in beginner lens mode
 * @param path The file or directory path
 * @param isDirectory Whether the path is a directory
 * @returns true if the file/directory should be filtered out, false otherwise
 */
export function shouldFilterInBeginnerMode(path: string, isDirectory: boolean): boolean {
  // Normalize path to handle both slash types
  const normalizedPath = path.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  
  // Check if it's a directory that should be filtered
  if (isDirectory) {
    // Check if any part of the path matches a filtered directory name
    for (const dir of filteredDirectories) {
      // Check exact match for directory name
      if (pathParts.some(part => part.toLowerCase() === dir.toLowerCase())) {
        return true;
      }
      
      // Check if directory is a subdirectory of a filtered directory
      const dirParts = dir.split('/');
      if (dirParts.length > 1) {
        // For multi-level directory patterns like 'bootstrap/cache'
        const dirPattern = dirParts.join('/');
        if (normalizedPath.toLowerCase().includes(dirPattern.toLowerCase())) {
          return true;
        }
      }
    }
    return false;
  }
  
  // Check if the file name matches any filtered file
  for (const file of filteredFiles) {
    // Handle wildcard patterns like .eslintrc*
    if (file.endsWith('*')) {
      const prefix = file.slice(0, -1);
      if (fileName.toLowerCase().startsWith(prefix.toLowerCase())) {
        return true;
      }
    } else if (fileName.toLowerCase() === file.toLowerCase()) {
      return true;
    }
  }
  
  // Check if the file extension matches any filtered extension
  for (const ext of filteredExtensions) {
    if (fileName.toLowerCase().endsWith(ext.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}
