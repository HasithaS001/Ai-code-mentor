# AI Code Mentor - API Documentation

## 📋 Overview

The AI Code Mentor API provides endpoints for project management, code analysis, AI-powered explanations, and interactive learning features. All endpoints are built using Next.js API routes and follow RESTful conventions.

## 🔗 Base URL

```
http://localhost:3000/api  (Development)
https://your-domain.com/api  (Production)
```

## 🔐 Authentication

Currently, the API uses API keys for external services (Google Gemini AI). No user authentication is required for the main application endpoints.

### Required Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

## 📚 API Endpoints

### 1. Project Management

#### Upload Project
Upload a ZIP file or clone a Git repository to create a new project.

**Endpoint:** `POST /api/upload-project`

**Content-Type:** `multipart/form-data`

**Request Body:**
```typescript
// For ZIP upload
{
  uploadType: 'zip',
  file: File  // ZIP file
}

// For Git clone
{
  uploadType: 'git',
  repoUrl: string  // Git repository URL
}
```

**Response:**
```typescript
{
  projectId: string,      // Unique project identifier
  summary: string,        // AI-generated project summary
  fileCount: number       // Number of files processed
}
```

**Example:**
```javascript
const formData = new FormData();
formData.append('uploadType', 'zip');
formData.append('file', zipFile);

const response = await fetch('/api/upload-project', {
  method: 'POST',
  body: formData
});

const data = await response.json();
// { projectId: "project_1234567890", summary: "...", fileCount: 25 }
```

#### Get Project Files
Retrieve the file structure of an uploaded project.

**Endpoint:** `GET /api/project-files/[projectId]`

**Parameters:**
- `projectId` (path): Project identifier

**Response:**
```typescript
{
  files: FileNode[]
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}
```

**Example:**
```javascript
const response = await fetch('/api/project-files/project_1234567890');
const data = await response.json();
```

#### Get File Content
Retrieve the content of a specific file within a project.

**Endpoint:** `GET /api/file-content/[projectId]?path=<file-path>`

**Parameters:**
- `projectId` (path): Project identifier
- `path` (query): File path within the project

**Response:**
```typescript
{
  content: string,    // File content
  language: string    // Detected programming language
}
```

**Example:**
```javascript
const response = await fetch('/api/file-content/project_1234567890?path=src/main.js');
const data = await response.json();
```

### 2. AI-Powered Code Analysis

#### Explain Code
Get AI-generated explanations for code snippets.

**Endpoint:** `POST /api/explain-code`

**Request Body:**
```typescript
{
  code: string  // Code snippet to explain
}
```

**Response:**
```typescript
{
  explanation: string  // Detailed code explanation
}
```

**Example:**
```javascript
const response = await fetch('/api/explain-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }'
  })
});

const data = await response.json();
```

#### Generate Visual Explanation
Create visual flow diagrams for code snippets.

**Endpoint:** `POST /api/generate-visual`

**Request Body:**
```typescript
{
  code: string,     // Code to visualize
  language: string  // Programming language
}
```

**Response:**
```typescript
{
  nodes: FlowNode[],
  edges: FlowEdge[],
  title: string,
  description: string
}

interface FlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { label: string };
  style?: Record<string, any>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
}
```

**Example:**
```javascript
const response = await fetch('/api/generate-visual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'if (x > 0) { return x * 2; } else { return 0; }',
    language: 'javascript'
  })
});

const data = await response.json();
```

### 3. Interactive Learning

#### Generate Quiz
Create interactive quizzes based on code snippets.

**Endpoint:** `POST /api/generate-quiz`

**Request Body:**
```typescript
{
  code: string,                    // Code to create quiz from
  language: string,                // Programming language
  difficulty?: 'beginner' | 'intermediate' | 'advanced',  // Default: 'beginner'
  questionCount?: number,          // Default: 5
  fullFileAnalysis?: boolean       // Default: false
}
```

**Response:**
```typescript
{
  questions: QuizQuestion[]
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;  // Index of correct answer (0-3)
  explanation: string;
}
```

**Example:**
```javascript
const response = await fetch('/api/generate-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'const arr = [1, 2, 3]; const doubled = arr.map(x => x * 2);',
    language: 'javascript',
    difficulty: 'beginner',
    questionCount: 3
  })
});

const data = await response.json();
```

#### Chat with AI
Interactive chat functionality for code-related questions.

**Endpoint:** `POST /api/chat`

**Request Body:**
```typescript
{
  projectId: string,  // Project context
  message: string     // User question
}
```

**Response:**
```typescript
{
  response: string  // AI-generated response
}
```

**Example:**
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'project_1234567890',
    message: 'What does the main function do?'
  })
});

const data = await response.json();
```

### 4. Text-to-Speech

#### Convert Text to Speech
Generate audio from text explanations.

**Endpoint:** `POST /api/text-to-speech`

**Request Body:**
```typescript
{
  text: string  // Text to convert to speech
}
```

**Response:**
```typescript
{
  audioUrl: string  // URL to generated audio file
}
```

**Example:**
```javascript
const response = await fetch('/api/text-to-speech', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'This function calculates the factorial of a number recursively.'
  })
});

const data = await response.json();
```

## ⚠️ Error Handling

All API endpoints return consistent error responses:

```typescript
{
  error: string,      // Error message
  details?: string    // Additional error details (optional)
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (project/file not found)
- `500` - Internal Server Error

### Example Error Response
```json
{
  "error": "Project not found",
  "details": "The specified project ID does not exist"
}
```

## 🔄 Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing:
- Request rate limits per IP
- API key-based quotas
- Concurrent request limits

## 📝 Request/Response Examples

### Complete Project Upload Flow
```javascript
// 1. Upload project
const formData = new FormData();
formData.append('uploadType', 'zip');
formData.append('file', zipFile);

const uploadResponse = await fetch('/api/upload-project', {
  method: 'POST',
  body: formData
});
const { projectId } = await uploadResponse.json();

// 2. Get file structure
const filesResponse = await fetch(`/api/project-files/${projectId}`);
const { files } = await filesResponse.json();

// 3. Get specific file content
const fileResponse = await fetch(`/api/file-content/${projectId}?path=src/main.js`);
const { content, language } = await fileResponse.json();

// 4. Explain code snippet
const explainResponse = await fetch('/api/explain-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: content.substring(0, 200) })
});
const { explanation } = await explainResponse.json();
```

## 🛠️ Development Notes

### Adding New Endpoints
1. Create new route file in `src/app/api/`
2. Implement request validation
3. Add error handling
4. Update this documentation
5. Add TypeScript interfaces

### Testing API Endpoints
Use tools like:
- Postman for manual testing
- curl for command-line testing
- Jest for automated testing

### Performance Considerations
- Implement caching for expensive operations
- Use streaming for large file uploads
- Add request timeout handling
- Monitor API response times
