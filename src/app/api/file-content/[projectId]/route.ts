import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    // Validate projectId format to prevent directory traversal attacks
    if (!projectId.match(/^project_\d+$/)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }
    
    // Prevent directory traversal attacks
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(process.cwd(), 'projects', projectId, normalizedPath);
    
    // Check if file exists and is not a directory
    try {
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        return NextResponse.json({ error: 'Path is a directory, not a file' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read file content
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      
      // Determine language based on file extension
      const extension = path.extname(filePath).toLowerCase().substring(1);
      let language = extension;
      
      // Map common extensions to languages
      const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'rb': 'ruby',
        'java': 'java',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
        'txt': 'text',
      };
      
      if (languageMap[extension]) {
        language = languageMap[extension];
      }
      
      return NextResponse.json({
        name: path.basename(filePath),
        path: filePath,
        content,
        language
      });
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json({ error: 'Failed to read file content' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching file content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file content' },
      { status: 500 }
    );
  }
}
