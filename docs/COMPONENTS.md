# AI Code Mentor - Component Documentation

## 📋 Overview

This document provides detailed information about all React components in the AI Code Mentor application, including their props, functionality, and usage patterns.

## 🏗️ Component Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Page Components**: Top-level components for routes
- **Feature Components**: Complex components with specific functionality
- **UI Components**: Reusable interface elements
- **Layout Components**: Structure and navigation components

## 📱 Core Components

### 1. CodeEditor Component

**Location:** `src/components/CodeEditor.tsx`

**Purpose:** Main code viewing and interaction interface with AI-powered explanations.

#### Props
```typescript
interface CodeEditorProps {
  file: {
    name: string;      // File name
    content: string;   // File content
    language: string;  // Programming language
  };
}
```

#### Features
- Monaco Editor integration with syntax highlighting
- Code selection and explanation functionality
- Visual diagram generation
- Text-to-speech narration
- Multi-tab interface (Text, Visual, Voice)
- Resizable explanation panel
- Language detection and translation support

#### State Management
```typescript
const [selectedCode, setSelectedCode] = useState<string>('');
const [explanation, setExplanation] = useState<string | null>(null);
const [isExplaining, setIsExplaining] = useState<boolean>(false);
const [activeTab, setActiveTab] = useState<'text' | 'visual' | 'voice'>('text');
```

#### Usage Example
```jsx
<CodeEditor 
  file={{
    name: "main.js",
    content: "console.log('Hello World');",
    language: "javascript"
  }}
/>
```

#### Key Methods
- `handleEditorDidMount()`: Initialize Monaco Editor
- `handleSelectionChange()`: Process code selection
- `explainSelectedCode()`: Get AI explanation
- `generateVisualExplanation()`: Create flow diagrams

---

### 2. FileExplorer Component

**Location:** `src/components/FileExplorer.tsx`

**Purpose:** Project file navigation with intelligent filtering capabilities.

#### Props
```typescript
interface FileExplorerProps {
  files: FileNode[];
  onSelectFile: (file: { name: string; path: string }) => void;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}
```

#### Features
- Hierarchical file tree display
- Beginner Lens filtering
- Expandable/collapsible directories
- File type icons
- Search functionality
- Responsive design

#### State Management
```typescript
const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
const [beginnerMode, setBeginnerMode] = useState<boolean>(true);
const [searchTerm, setSearchTerm] = useState<string>('');
```

#### Usage Example
```jsx
<FileExplorer 
  files={projectFiles}
  onSelectFile={(file) => setSelectedFile(file)}
/>
```

---

### 3. ChatInterface Component

**Location:** `src/components/ChatInterface.tsx`

**Purpose:** AI-powered chat interface for code-related questions and quiz generation.

#### Props
```typescript
interface ChatInterfaceProps {
  projectId: string;
  selectedFile?: {
    name: string;
    content: string;
    language: string;
  } | null;
}
```

#### Features
- Real-time chat with AI
- Message history
- Voice input support
- Quiz generation mode
- Interactive quiz interface
- Speech recognition
- Typing indicators

#### State Management
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState<string>('');
const [isLoading, setIsLoading] = useState<boolean>(false);
const [showQuizMode, setShowQuizMode] = useState<boolean>(false);
const [quizData, setQuizData] = useState<QuizData | null>(null);
```

#### Usage Example
```jsx
<ChatInterface 
  projectId="project_123"
  selectedFile={currentFile}
/>
```

---

### 4. VisualExplanation Component

**Location:** `src/components/VisualExplanation.tsx`

**Purpose:** Interactive flow diagrams for code visualization using ReactFlow.

#### Props
```typescript
interface VisualExplanationProps {
  code: string;        // Code to visualize
  language: string;    // Programming language
  panelHeight?: number; // Container height
}
```

#### Features
- Dynamic flow diagram generation
- Interactive node manipulation
- Zoom and pan controls
- Responsive layout
- Error handling
- Loading states

#### State Management
```typescript
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

#### Usage Example
```jsx
<VisualExplanation 
  code="if (x > 0) return x * 2;"
  language="javascript"
  panelHeight={400}
/>
```

---

### 5. ProjectUpload Component

**Location:** `src/components/ProjectUpload.tsx`

**Purpose:** Project upload interface supporting ZIP files and Git repositories.

#### Props
```typescript
// No props - self-contained component
```

#### Features
- Drag-and-drop file upload
- Git repository cloning
- Upload progress tracking
- Error handling and validation
- Multiple upload methods
- File type validation

#### State Management
```typescript
const [isUploading, setIsUploading] = useState<boolean>(false);
const [uploadType, setUploadType] = useState<'zip' | 'git'>('zip');
const [repoUrl, setRepoUrl] = useState<string>('');
const [error, setError] = useState<string>('');
```

#### Usage Example
```jsx
<ProjectUpload />
```

---

### 6. ProjectSummary Component

**Location:** `src/components/ProjectSummary.tsx`

**Purpose:** Display AI-generated project summaries and overviews.

#### Props
```typescript
interface ProjectSummaryProps {
  projectId: string;
  summary?: string;
}
```

#### Features
- Formatted summary display
- Technology stack detection
- File statistics
- Project insights
- Responsive layout

#### Usage Example
```jsx
<ProjectSummary 
  projectId="project_123"
  summary="This is a React application..."
/>
```

## 🎨 UI Components

### 7. Header Component

**Location:** `src/components/Header.tsx`

**Purpose:** Navigation header with project context and settings.

#### Props
```typescript
interface HeaderProps {
  projectId?: string;
}
```

#### Features
- Logo and branding
- Project information display
- Settings access
- Navigation links
- Responsive design

---

### 8. SettingsModal Component

**Location:** `src/components/SettingsModal.tsx`

**Purpose:** User preferences and configuration interface.

#### Props
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### Features
- Voice settings configuration
- Language preferences
- Theme selection
- API key management
- Modal overlay

---

### 9. SettingsButton Component

**Location:** `src/components/SettingsButton.tsx`

**Purpose:** Settings access button with context awareness.

#### Props
```typescript
interface SettingsButtonProps {
  className?: string;
}
```

## 🔧 Utility Components

### 10. CodeHighlightOverlay Component

**Location:** `src/components/CodeHighlightOverlay.tsx`

**Purpose:** Visual highlighting overlay for code selections.

#### Props
```typescript
interface CodeHighlightOverlayProps {
  highlights: HighlightRange[];
  editorRef: React.RefObject<any>;
}
```

### 11. FlowerConfetti Component

**Location:** `src/components/FlowerConfetti.tsx`

**Purpose:** Celebration animation for quiz completions.

#### Props
```typescript
interface FlowerConfettiProps {
  isActive: boolean;
  onComplete: () => void;
}
```

## 🎯 Component Patterns

### 1. Container/Presentational Pattern
```typescript
// Container Component
const FileExplorerContainer = ({ projectId }: { projectId: string }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  
  useEffect(() => {
    fetchProjectFiles(projectId).then(setFiles);
  }, [projectId]);
  
  return <FileExplorer files={files} onSelectFile={handleFileSelect} />;
};

// Presentational Component
const FileExplorer = ({ files, onSelectFile }: FileExplorerProps) => {
  return (
    <div className="file-explorer">
      {files.map(file => (
        <FileTreeNode key={file.path} node={file} onSelect={onSelectFile} />
      ))}
    </div>
  );
};
```

### 2. Custom Hooks Pattern
```typescript
// Custom hook for code highlighting
const useCodeHighlight = (editorRef: React.RefObject<any>) => {
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  
  const addHighlight = useCallback((range: HighlightRange) => {
    setHighlights(prev => [...prev, range]);
  }, []);
  
  return { highlights, addHighlight };
};
```

### 3. Context Provider Pattern
```typescript
// Settings Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
```

## 🔄 Component Lifecycle

### Typical Component Flow
1. **Mount**: Initialize state, fetch data
2. **Update**: Handle prop changes, re-render
3. **Interaction**: Process user events
4. **Cleanup**: Remove listeners, cancel requests

### Error Boundaries
```typescript
class ComponentErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

## 🎨 Styling Conventions

### Tailwind CSS Classes
- Use utility-first approach
- Consistent spacing scale
- Responsive design patterns
- Dark theme support

### Component Styling Example
```typescript
const CodeEditor = ({ file }: CodeEditorProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#010105] text-gray-300">
      <div className="relative flex-1 scrollable-section">
        <Editor
          height="100%"
          theme="custom-dark"
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  );
};
```

## 🧪 Testing Components

### Unit Testing Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FileExplorer } from '../FileExplorer';

describe('FileExplorer', () => {
  const mockFiles = [
    { name: 'src', path: 'src', type: 'directory', children: [] }
  ];
  
  it('renders file tree correctly', () => {
    render(<FileExplorer files={mockFiles} onSelectFile={jest.fn()} />);
    expect(screen.getByText('src')).toBeInTheDocument();
  });
  
  it('handles file selection', () => {
    const onSelectFile = jest.fn();
    render(<FileExplorer files={mockFiles} onSelectFile={onSelectFile} />);
    
    fireEvent.click(screen.getByText('src'));
    expect(onSelectFile).toHaveBeenCalled();
  });
});
```
