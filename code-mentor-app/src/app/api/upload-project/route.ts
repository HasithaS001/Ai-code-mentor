import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { simpleGit } from 'simple-git';
import { getProjectSummary } from '../../../utils/gemini';

// Helper function to create a unique project directory
async function createProjectDirectory() {
  const projectId = `project_${Date.now()}`;
  const projectDir = path.join(process.cwd(), 'projects', projectId);
  
  await mkdir(projectDir, { recursive: true });
  return { projectId, projectDir };
}

// Helper function to read file contents from a directory
async function readProjectFiles(dir: string, baseDir = ''): Promise<{ name: string; content: string }[]> {
  const fs = await import('fs/promises');
  const files: { name: string; content: string }[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(baseDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .git directories
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          const subDirFiles = await readProjectFiles(fullPath, relativePath);
          files.push(...subDirFiles);
        }
      } else {
        try {
          // Skip binary files and large files
          const stat = await fs.stat(fullPath);
          if (stat.size < 1000000) { // Skip files larger than 1MB
            const content = await fs.readFile(fullPath, 'utf-8');
            files.push({ name: relativePath, content });
          }
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadType = formData.get('uploadType') as string;
    
    const { projectId, projectDir } = await createProjectDirectory();
    let files: { name: string; content: string }[] = [];
    
    if (uploadType === 'zip') {
      // Handle ZIP file upload
      const zipFile = formData.get('file') as File;
      
      if (!zipFile) {
        return NextResponse.json({ error: 'No ZIP file provided' }, { status: 400 });
      }
      
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
      const zip = await JSZip.loadAsync(zipBuffer);
      
      // Extract ZIP contents
      for (const [filename, fileData] of Object.entries(zip.files)) {
        if (!fileData.dir) {
          const content = await fileData.async('string');
          const filePath = path.join(projectDir, filename);
          const fileDir = path.dirname(filePath);
          
          await mkdir(fileDir, { recursive: true });
          await writeFile(filePath, content);
          
          files.push({ name: filename, content });
        }
      }
    } else if (uploadType === 'git') {
      // Handle Git repository clone
      const repoUrl = formData.get('repoUrl') as string;
      
      if (!repoUrl) {
        return NextResponse.json({ error: 'No repository URL provided' }, { status: 400 });
      }
      
      const git = simpleGit();
      await git.clone(repoUrl, projectDir);
      
      // Read files from cloned repository
      files = await readProjectFiles(projectDir);
    } else {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }
    
    // Generate project summary using Gemini
    const summary = await getProjectSummary(files);
    
    return NextResponse.json({
      projectId,
      summary,
      fileCount: files.length,
    });
  } catch (error) {
    console.error('Error handling project upload:', error);
    return NextResponse.json(
      { error: 'Failed to process project upload' },
      { status: 500 }
    );
  }
}
