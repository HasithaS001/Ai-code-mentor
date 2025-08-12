import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Helper function to build file tree structure
async function buildFileTree(dir: string, basePath = ''): Promise<any[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        const children = await buildFileTree(fullPath, relativePath);
        result.push({
          name: entry.name,
          path: relativePath,
          type: 'directory',
          children
        });
      }
    } else {
      result.push({
        name: entry.name,
        path: relativePath,
        type: 'file'
      });
    }
  }

  // Sort directories first, then files alphabetically
  return result.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'directory' ? -1 : 1;
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    
    // Validate projectId format to prevent directory traversal attacks
    if (!projectId.match(/^project_\d+$/)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }
    
    const projectDir = path.join(process.cwd(), 'projects', projectId);
    
    // Check if project directory exists
    try {
      await fs.access(projectDir);
    } catch (error) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Build file tree structure
    const fileTree = await buildFileTree(projectDir);
    
    return NextResponse.json({ files: fileTree });
  } catch (error) {
    console.error('Error fetching project files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project files' },
      { status: 500 }
    );
  }
}
