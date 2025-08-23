# AI Code Mentor - Developer Guide

## 🎯 Overview

This guide is for developers who want to contribute to, extend, or understand the AI Code Mentor codebase. It covers development setup, architecture patterns, coding standards, and contribution guidelines.

## 🛠️ Development Environment Setup

### Prerequisites
- Node.js 18+ with npm/yarn/pnpm
- Git for version control
- VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/ai-code-mentor.git
cd ai-code-mentor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript checks
npm test             # Run tests (when implemented)
```

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI Integration**: Google Gemini AI
- **Code Editor**: Monaco Editor
- **Visualization**: ReactFlow
- **File Processing**: JSZip, Simple Git

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers
│   ├── dashboard/         # Main application pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── types/                # TypeScript definitions
├── utils/                # Utility functions
└── config/               # Configuration files
```

### Key Design Patterns

#### 1. Component Composition
```typescript
// Container component handles data and logic
const CodeEditorContainer = ({ projectId, filePath }: Props) => {
  const [file, setFile] = useState<FileData | null>(null);
  
  useEffect(() => {
    fetchFileContent(projectId, filePath).then(setFile);
  }, [projectId, filePath]);
  
  if (!file) return <LoadingSpinner />;
  
  return <CodeEditor file={file} onExplain={handleExplain} />;
};

// Presentational component focuses on UI
const CodeEditor = ({ file, onExplain }: Props) => {
  return (
    <div className="code-editor">
      <Editor value={file.content} language={file.language} />
      <ExplanationPanel onExplain={onExplain} />
    </div>
  );
};
```

#### 2. Custom Hooks for Logic Reuse
```typescript
// Custom hook for code explanation functionality
export const useCodeExplanation = () => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const explainCode = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Failed to explain code:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { explanation, isLoading, explainCode };
};
```

#### 3. Context for Global State
```typescript
// Settings context for user preferences
interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    localStorage.setItem('ai-code-mentor-settings', JSON.stringify({ ...settings, ...newSettings }));
  }, [settings]);
  
  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
```

## 🔧 API Development

### Creating New API Routes

#### 1. Route Structure
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Handle GET request
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Required field missing' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processData(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Input Validation
```typescript
import { z } from 'zod';

const ExplainCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().optional(),
  context: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ExplainCodeSchema.parse(body);
    
    // Process validated data
    const explanation = await explainCode(validatedData);
    
    return NextResponse.json({ explanation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### AI Integration Patterns

#### 1. Gemini AI Service
```typescript
// src/utils/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateExplanation(code: string, context?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `
    You are an expert code mentor. Explain the following code in simple, beginner-friendly terms:
    
    ${context ? `Context: ${context}` : ''}
    
    Code:
    \`\`\`
    ${code}
    \`\`\`
    
    Provide a clear explanation that covers:
    1. What the code does
    2. How it works step by step
    3. Key concepts used
    4. Any important details a beginner should know
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate explanation');
  }
}
```

#### 2. Error Handling and Retries
```typescript
export async function generateWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## 🎨 Frontend Development

### Component Development Guidelines

#### 1. Component Structure
```typescript
// Component interface
interface ComponentProps {
  // Required props
  data: DataType;
  onAction: (item: DataType) => void;
  
  // Optional props with defaults
  className?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// Component implementation
export const MyComponent = ({ 
  data, 
  onAction, 
  className = '', 
  variant = 'primary',
  disabled = false 
}: ComponentProps) => {
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers
  const handleClick = useCallback(async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onAction(data);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, onAction, disabled, isLoading]);
  
  // Render
  return (
    <div className={`my-component ${variant} ${className}`}>
      <button onClick={handleClick} disabled={disabled || isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
};
```

#### 2. Styling with Tailwind CSS
```typescript
// Use consistent spacing and color schemes
const CodeEditor = ({ file }: Props) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#010105] text-gray-300">
      <div className="flex-1 relative">
        <Editor
          height="100%"
          theme="custom-dark"
          className="border border-gray-700/50 rounded-lg"
        />
      </div>
      
      <div className="border-t border-gray-700 bg-[#0a0a0a] p-4">
        <ExplanationPanel />
      </div>
    </div>
  );
};

// Create reusable style utilities
export const buttonStyles = {
  base: "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2",
  primary: "bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
  disabled: "opacity-50 cursor-not-allowed"
};
```

### State Management Patterns

#### 1. Local State with useState
```typescript
const FileExplorer = ({ files }: Props) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const toggleDirectory = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);
  
  return (
    <div className="file-explorer">
      {files.map(file => (
        <FileNode
          key={file.path}
          file={file}
          isExpanded={expandedDirs.has(file.path)}
          isSelected={selectedFile === file.path}
          onToggle={toggleDirectory}
          onSelect={setSelectedFile}
        />
      ))}
    </div>
  );
};
```

#### 2. Global State with Context
```typescript
// Create context with proper typing
interface AppContextType {
  currentProject: Project | null;
  selectedFile: FileData | null;
  setCurrentProject: (project: Project) => void;
  setSelectedFile: (file: FileData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook for consuming context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

## 🧪 Testing Guidelines

### Unit Testing Components
```typescript
// __tests__/components/CodeEditor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeEditor } from '../CodeEditor';

const mockFile = {
  name: 'test.js',
  content: 'console.log("Hello World");',
  language: 'javascript'
};

describe('CodeEditor', () => {
  it('renders code content correctly', () => {
    render(<CodeEditor file={mockFile} />);
    expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument();
  });
  
  it('handles code selection and explanation', async () => {
    const mockExplain = jest.fn();
    render(<CodeEditor file={mockFile} onExplain={mockExplain} />);
    
    // Simulate code selection
    const editor = screen.getByRole('textbox');
    fireEvent.select(editor, { target: { selectionStart: 0, selectionEnd: 10 } });
    
    // Click explain button
    const explainButton = screen.getByText('Explain Code');
    fireEvent.click(explainButton);
    
    await waitFor(() => {
      expect(mockExplain).toHaveBeenCalledWith('console.log');
    });
  });
});
```

### API Testing
```typescript
// __tests__/api/explain-code.test.ts
import { POST } from '../../src/app/api/explain-code/route';
import { NextRequest } from 'next/server';

// Mock external dependencies
jest.mock('../../src/utils/gemini', () => ({
  explainCodeSnippet: jest.fn()
}));

describe('/api/explain-code', () => {
  it('returns explanation for valid code', async () => {
    const mockExplain = require('../../src/utils/gemini').explainCodeSnippet;
    mockExplain.mockResolvedValue('This code logs a message to the console.');
    
    const request = new NextRequest('http://localhost:3000/api/explain-code', {
      method: 'POST',
      body: JSON.stringify({ code: 'console.log("Hello");' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.explanation).toBe('This code logs a message to the console.');
  });
  
  it('returns error for missing code', async () => {
    const request = new NextRequest('http://localhost:3000/api/explain-code', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Code snippet is required');
  });
});
```

## 🔧 Development Tools

### VS Code Configuration
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["className\\s*=\\s*[\"']([^\"']*)[\"']", "([^\"'\\s]*)"]
  ]
}
```

### ESLint Configuration
```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "error"
    }
  }
];

export default eslintConfig;
```

## 🚀 Contributing Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful commit messages

### Pull Request Process
1. **Fork the repository** and create a feature branch
2. **Write tests** for new functionality
3. **Update documentation** as needed
4. **Run linting and tests** before submitting
5. **Create a detailed PR description** explaining changes

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(api): add quiz generation endpoint
fix(editor): resolve syntax highlighting issue
docs(readme): update installation instructions
refactor(components): extract reusable button component
```

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed

## 📈 Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const VisualExplanation = lazy(() => import('./VisualExplanation'));
const QuizInterface = lazy(() => import('./QuizInterface'));

const CodeEditor = ({ file }: Props) => {
  return (
    <div>
      <Editor file={file} />
      <Suspense fallback={<LoadingSpinner />}>
        <VisualExplanation code={selectedCode} />
      </Suspense>
    </div>
  );
};
```

### Memoization
```typescript
// Memoize expensive calculations
const FileExplorer = ({ files }: Props) => {
  const filteredFiles = useMemo(() => {
    return files.filter(file => shouldShowFile(file, beginnerMode));
  }, [files, beginnerMode]);
  
  return (
    <div>
      {filteredFiles.map(file => (
        <FileNode key={file.path} file={file} />
      ))}
    </div>
  );
};

// Memoize components that don't change often
const FileNode = memo(({ file, onSelect }: Props) => {
  return (
    <div onClick={() => onSelect(file)}>
      {file.name}
    </div>
  );
});
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

This developer guide provides the foundation for contributing to and extending the AI Code Mentor application. For specific implementation details, refer to the existing codebase and feel free to ask questions in issues or discussions.
