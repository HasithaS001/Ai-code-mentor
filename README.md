# AI Code Mentor 🤖📚

An intelligent code learning platform that transforms any codebase into an interactive learning experience. Upload your projects and get AI-powered explanations, visual diagrams, quizzes, and voice narration to understand code like never before.

![AI Code Mentor](public/code.jpg)

## 🌟 Features

### 🔍 **Intelligent Code Analysis**

- **AI-Powered Explanations**: Select any code snippet and get detailed, beginner-friendly explanations
- **Visual Flow Diagrams**: Automatically generate flowcharts and diagrams to visualize code logic
- **Interactive Code Editor**: Monaco Editor with syntax highlighting and intelligent features
- **Beginner Lens**: Filter complex files to focus on learning-friendly content

### 🎯 **Interactive Learning**

- **AI Chat Assistant**: Ask questions about your codebase and get contextual answers
- **Code Quizzes**: Generate custom quizzes based on your code to test understanding
- **Voice Narration**: Text-to-speech functionality for audio learning
- **Project Summaries**: Get comprehensive overviews of entire codebases

### 📁 **Project Management**

- **Multiple Upload Methods**: Support for ZIP files and Git repository cloning
- **File Explorer**: Navigate through project structure with intelligent filtering
- **Multi-Language Support**: Works with JavaScript, Python, Java, C++, and more
- **Real-time Processing**: Fast analysis and explanation generation

### 🎨 **Modern Interface**

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Eye-friendly interface for extended coding sessions
- **Intuitive Navigation**: Clean, modern UI built with Tailwind CSS
- **Real-time Feedback**: Loading states and progress indicators

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Google Gemini API key
- (Optional) Google Cloud Text-to-Speech credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ai-code-mentor.git
   cd ai-code-mentor
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash

   # Optional: For text-to-speech functionality
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_PRIVATE_KEY=your_private_key
   GOOGLE_CLOUD_CLIENT_EMAIL=your_client_email
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to start using the application.

## 📖 How to Use

### 1. **Upload Your Project**

- **ZIP Upload**: Drag and drop a ZIP file containing your project
- **Git Clone**: Enter a public GitHub repository URL to clone directly

### 2. **Explore Your Code**

- Use the file explorer to navigate through your project structure
- Toggle "Beginner Lens" to filter out complex configuration files
- Click on any file to open it in the code editor

### 3. **Get AI Explanations**

- Select any code snippet in the editor
- Click "Explain Code" to get detailed explanations
- Switch between text explanations and visual diagrams
- Use voice narration for audio learning

### 4. **Interactive Learning**

- Chat with the AI assistant about your code
- Generate quizzes to test your understanding
- Ask specific questions about functions, classes, or algorithms

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Code Editor**: Monaco Editor
- **AI Integration**: Google Gemini AI
- **Text-to-Speech**: Google Cloud TTS, AWS Polly, ElevenLabs
- **File Processing**: JSZip, Simple Git
- **Visualization**: ReactFlow
- **Icons**: Lucide React, React Icons

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # Chat functionality
│   │   ├── explain-code/  # Code explanation
│   │   ├── generate-quiz/ # Quiz generation
│   │   ├── generate-visual/ # Visual diagrams
│   │   ├── upload-project/ # Project upload
│   │   └── text-to-speech/ # Voice narration
│   ├── dashboard/         # Main dashboard pages
│   └── project-summary/   # Project summary pages
├── components/            # React components
│   ├── ChatInterface.tsx  # AI chat component
│   ├── CodeEditor.tsx     # Monaco code editor
│   ├── FileExplorer.tsx   # Project file browser
│   ├── ProjectUpload.tsx  # Upload interface
│   └── VisualExplanation.tsx # Flow diagrams
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
│   ├── gemini.ts         # AI integration
│   ├── tts.ts            # Text-to-speech
│   └── translation.ts    # Language support
└── config/               # Configuration files
```

## 🔧 API Endpoints

### Core Functionality

- `POST /api/upload-project` - Upload ZIP files or clone Git repositories
- `GET /api/project-files/[projectId]` - Get project file structure
- `GET /api/file-content/[projectId]` - Get specific file content
- `POST /api/explain-code` - Get AI explanations for code snippets
- `POST /api/generate-visual` - Generate visual flow diagrams
- `POST /api/generate-quiz` - Create interactive code quizzes
- `POST /api/chat` - Chat with AI about the codebase
- `POST /api/text-to-speech` - Convert text to speech

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful code analysis
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience
- [ReactFlow](https://reactflow.dev/) for interactive diagrams
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling

## 📞 Support

- 📧 Email: support@aicodementor.com
- 💬 Discord: [Join our community](https://discord.gg/aicodementor)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/ai-code-mentor/issues)
- 📖 Documentation: [Full Documentation](docs/README.md)

---

**Made with ❤️ by the AI Code Mentor team**
