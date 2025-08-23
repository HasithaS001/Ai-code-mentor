# AI Code Mentor - Frequently Asked Questions

## 🤔 General Questions

### What is AI Code Mentor?
AI Code Mentor is an intelligent code learning platform that transforms any codebase into an interactive learning experience. Upload your projects and get AI-powered explanations, visual diagrams, quizzes, and voice narration to understand code like never before.

### Who is this for?
- **Beginners**: Learning to code or understanding new programming languages
- **Students**: Studying computer science or working on assignments
- **Developers**: Exploring new codebases or technologies
- **Educators**: Teaching programming concepts with visual aids
- **Code Reviewers**: Understanding complex code quickly

### Is it free to use?
The application is open-source and free to use. However, you'll need your own API keys for:
- Google Gemini AI (required for code explanations)
- Text-to-speech services (optional for voice features)

### What programming languages are supported?
AI Code Mentor supports most popular programming languages including:
- JavaScript/TypeScript
- Python
- Java
- C/C++
- C#
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- And many more!

## 🚀 Getting Started

### How do I upload my project?
You have two options:
1. **ZIP Upload**: Create a ZIP file of your project and drag-and-drop it onto the upload area
2. **Git Clone**: Enter a public GitHub repository URL to clone it directly

### What file types can I upload?
You can upload any text-based code files. The system automatically filters out:
- Binary files
- Very large files (>1MB)
- Build artifacts
- Dependencies (node_modules, etc.)

### Why can't I upload private repositories?
Currently, the system only supports public GitHub repositories for Git cloning. For private code, use the ZIP upload method.

### How long does project analysis take?
- **Small projects** (<50 files): 10-30 seconds
- **Medium projects** (50-200 files): 30-60 seconds
- **Large projects** (200+ files): 1-3 minutes

## 💻 Using the Platform

### How do I get code explanations?
1. Select any code snippet in the editor by clicking and dragging
2. Click the "Explain Code" button that appears
3. Wait for the AI to generate an explanation
4. View the explanation in the panel below

### What is the "Beginner Lens"?
Beginner Lens is a smart filter that hides complex configuration files, build scripts, and other non-essential files. This helps beginners focus on the core application code without getting overwhelmed.

### How do visual diagrams work?
When you request an explanation, you can switch to the "Visual" tab to see:
- Flow charts showing code execution paths
- Interactive diagrams you can zoom and pan
- Visual representation of logic flow and decision points

### Can I hear explanations spoken aloud?
Yes! Switch to the "Voice" tab in the explanation panel to:
- Listen to AI-generated narration of code explanations
- Adjust playback speed
- Follow along while reading

### How do I use the chat feature?
1. Type questions about your codebase in the chat input
2. Ask specific questions like "What does the main function do?"
3. Use voice input by clicking the microphone button
4. Get contextual answers based on your uploaded project

### What are code quizzes?
Interactive quizzes generated from your code to test understanding:
1. Switch to "Quiz Mode" in the chat panel
2. Select a file and choose difficulty level
3. Answer multiple-choice questions about the code
4. Get immediate feedback and explanations

## 🔧 Technical Questions

### What AI model is used?
AI Code Mentor uses Google's Gemini AI for code analysis, explanations, and quiz generation. This provides high-quality, contextual understanding of code.

### Is my code stored permanently?
No, your code is processed temporarily and not stored permanently. Projects are cleaned up after your session ends for privacy and security.

### Can I use this offline?
No, AI Code Mentor requires an internet connection to:
- Process uploaded files
- Generate AI explanations
- Create visual diagrams
- Provide text-to-speech functionality

### What browsers are supported?
AI Code Mentor works best on modern browsers:
- **Chrome** 90+ (recommended)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Why are some features not working?
Common issues and solutions:
- **No explanations**: Check if you have a valid Gemini API key
- **No voice**: Ensure microphone permissions are granted
- **Slow performance**: Try a smaller project or refresh the page
- **Upload fails**: Check file size and internet connection

## 🛠️ Setup and Configuration

### How do I get a Gemini API key?
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Add it to your environment variables

### Do I need all the API keys?
- **Required**: Google Gemini API key for core functionality
- **Optional**: Text-to-speech API keys for voice features
- The app will work without TTS keys, just without voice narration

### How do I set up text-to-speech?
You can use any of these services:
- **Google Cloud TTS**: High-quality voices, requires service account
- **AWS Polly**: Good quality, requires AWS credentials
- **ElevenLabs**: Premium voices, requires API key

### Can I run this locally?
Yes! Follow the setup instructions in the README:
1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run `npm run dev`

## 🎯 Best Practices

### How do I get better explanations?
- **Select meaningful code chunks**: Choose complete functions or logical blocks
- **Provide context**: Ask specific questions about what you want to understand
- **Start simple**: Begin with basic functions before tackling complex algorithms
- **Use beginner lens**: Filter out complex files when starting

### What makes a good project for analysis?
- **Well-structured code**: Clear organization and naming
- **Reasonable size**: Not too large (under 1000 files)
- **Good documentation**: README files and comments help AI provide better context
- **Standard practices**: Following language conventions

### How can I learn most effectively?
1. **Start with overview**: Get project summary first
2. **Follow the flow**: Begin with main entry points
3. **Ask questions**: Use chat to clarify confusing parts
4. **Take quizzes**: Test your understanding regularly
5. **Use all modes**: Combine text, visual, and audio learning

## 🐛 Troubleshooting

### Upload is stuck or failing
- **Check file size**: Large projects take longer
- **Verify format**: Ensure ZIP files are properly formatted
- **Check connection**: Slow internet can cause timeouts
- **Try smaller project**: Break large projects into smaller parts

### Explanations are not generating
- **Verify API key**: Ensure Gemini API key is valid and has quota
- **Check selection**: Make sure code is properly selected
- **Try different code**: Some code might be too complex or unclear
- **Refresh page**: Sometimes a refresh resolves temporary issues

### Visual diagrams not showing
- **Wait for processing**: Diagrams take longer to generate than text
- **Try simpler code**: Complex code might not visualize well
- **Check browser**: Ensure JavaScript is enabled
- **Clear cache**: Browser cache might interfere

### Voice features not working
- **Check permissions**: Allow microphone access for voice input
- **Verify API keys**: TTS requires additional API configuration
- **Test audio**: Ensure system audio is working
- **Try different browser**: Some browsers handle audio better

## 📱 Mobile and Accessibility

### Does it work on mobile?
Yes, AI Code Mentor is responsive and works on mobile devices, though the experience is optimized for desktop use due to the code editing interface.

### Is it accessible?
The platform includes accessibility features:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Adjustable font sizes

### Can I use it with assistive technologies?
Yes, the platform is designed to work with:
- Screen readers
- Voice control software
- Keyboard-only navigation
- High contrast displays

## 🔒 Privacy and Security

### What data is collected?
- **Temporary file processing**: Code is processed but not stored
- **Usage analytics**: Basic usage statistics (if enabled)
- **No personal data**: No account creation or personal information required

### Is my code secure?
- **Temporary processing**: Code is not permanently stored
- **Encrypted transmission**: All data sent over HTTPS
- **No sharing**: Your code is not shared with third parties
- **Local processing**: Where possible, processing happens locally

### Can I use this for proprietary code?
While the platform is secure, consider:
- **Company policies**: Check your organization's code sharing policies
- **Sensitive data**: Avoid uploading code with secrets or credentials
- **Public repositories**: Only public repos can be cloned directly
- **Risk assessment**: Evaluate based on your security requirements

## 🚀 Future Features

### What's coming next?
- **More AI models**: Support for additional AI providers
- **Collaboration features**: Share explanations and insights
- **Advanced analytics**: Code quality and complexity metrics
- **More languages**: Support for additional programming languages
- **Offline mode**: Limited functionality without internet

### How can I request features?
- **GitHub Issues**: Create feature requests on the repository
- **Community Discord**: Discuss ideas with other users
- **Email**: Contact the development team directly
- **Contributions**: Submit pull requests for new features

---

**Still have questions?** 

- 📧 Email: support@aicodementor.com
- 💬 Discord: [Join our community](https://discord.gg/aicodementor)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/ai-code-mentor/issues)
- 📖 Documentation: [Full Documentation](docs/README.md)
