# Contributing to AI Code Mentor

## 🎯 Welcome Contributors!

Thank you for your interest in contributing to AI Code Mentor! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions
- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Submit bug fixes or new features
- **Documentation**: Improve or add documentation
- **Testing**: Help improve test coverage
- **UI/UX**: Enhance user experience and design

## 🚀 Getting Started

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/ai-code-mentor.git
cd ai-code-mentor

# Add upstream remote
git remote add upstream https://github.com/original-owner/ai-code-mentor.git
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# Start development server
npm run dev
```

### 3. Create a Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

## 📝 Development Guidelines

### Code Style
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Code formatting is handled automatically
- **Naming**: Use descriptive names for variables and functions

### Component Guidelines
```typescript
// ✅ Good: Descriptive interface and component structure
interface CodeEditorProps {
  file: FileData;
  onCodeSelect: (code: string) => void;
  isLoading?: boolean;
}

export const CodeEditor = ({ file, onCodeSelect, isLoading = false }: CodeEditorProps) => {
  // Component logic here
  return (
    <div className="code-editor">
      {/* Component JSX */}
    </div>
  );
};

// ❌ Avoid: Vague names and missing types
const Editor = ({ data, callback }: any) => {
  // Implementation
};
```

### API Route Guidelines
```typescript
// ✅ Good: Proper error handling and validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processCode(body.code);
    
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

### Testing Requirements
- Write unit tests for new components
- Add integration tests for API routes
- Ensure existing tests pass
- Aim for meaningful test coverage

```typescript
// Example test structure
describe('CodeEditor', () => {
  it('should render code content', () => {
    render(<CodeEditor file={mockFile} onCodeSelect={jest.fn()} />);
    expect(screen.getByText(mockFile.content)).toBeInTheDocument();
  });
  
  it('should handle code selection', () => {
    const onCodeSelect = jest.fn();
    render(<CodeEditor file={mockFile} onCodeSelect={onCodeSelect} />);
    
    // Simulate user interaction
    fireEvent.click(screen.getByText('Select Code'));
    
    expect(onCodeSelect).toHaveBeenCalled();
  });
});
```

## 🐛 Bug Reports

### Before Submitting
1. **Search existing issues** to avoid duplicates
2. **Check the latest version** to see if the bug is already fixed
3. **Reproduce the bug** in a clean environment

### Bug Report Template
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node.js version: [e.g. 18.0.0]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Before Submitting
1. **Check existing feature requests** to avoid duplicates
2. **Consider the scope** - does it fit the project's goals?
3. **Think about implementation** - is it technically feasible?

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How do you envision this feature working?

**Alternatives Considered**
What other solutions have you considered?

**Additional Context**
Any other context, mockups, or examples.
```

## 🔄 Pull Request Process

### 1. Before Submitting
- [ ] Code follows project style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main

### 2. Pull Request Template
```markdown
**Description**
Brief description of changes made.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

**Testing**
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

**Screenshots** (if applicable)
Add screenshots of UI changes.

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

### 3. Review Process
1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Merge** once approved

## 🎨 UI/UX Contributions

### Design Guidelines
- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure WCAG compliance
- **Responsiveness**: Support mobile and desktop
- **Performance**: Optimize for fast loading

### Design Tools
- **Figma**: For mockups and prototypes
- **Tailwind CSS**: For styling implementation
- **React Icons**: For consistent iconography

## 📚 Documentation Contributions

### Types of Documentation
- **API Documentation**: Endpoint descriptions and examples
- **Component Documentation**: Props and usage examples
- **User Guides**: Step-by-step instructions
- **Developer Guides**: Technical implementation details

### Documentation Standards
- **Clear and concise** writing
- **Code examples** for technical content
- **Screenshots** for user-facing features
- **Up-to-date** information

## 🏷️ Commit Message Guidelines

### Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(api): add quiz generation endpoint
fix(editor): resolve syntax highlighting issue
docs(readme): update installation instructions
refactor(components): extract reusable button component
test(api): add unit tests for explain-code endpoint
```

## 🎖️ Recognition

### Contributors
All contributors will be recognized in:
- **README.md**: Contributors section
- **GitHub**: Contributor graphs and statistics
- **Release Notes**: Major contributions highlighted

### Maintainer Path
Active contributors may be invited to become maintainers with:
- **Commit access** to the repository
- **Review responsibilities** for pull requests
- **Decision-making** input on project direction

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: Real-time chat with the community
- **Email**: Direct contact with maintainers

### Resources
- **Documentation**: Comprehensive guides and references
- **Code Examples**: Sample implementations
- **Video Tutorials**: Step-by-step walkthroughs
- **Community Wiki**: Shared knowledge base

## 🔒 Security

### Reporting Security Issues
- **Do not** create public issues for security vulnerabilities
- **Email** security@aicodementor.com with details
- **Include** steps to reproduce and potential impact
- **Wait** for confirmation before public disclosure

### Security Guidelines
- **Never commit** API keys or secrets
- **Use environment variables** for sensitive data
- **Validate all inputs** in API routes
- **Follow security best practices** for web applications

## 📄 License

By contributing to AI Code Mentor, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to AI Code Mentor!** 🚀

Your contributions help make code learning more accessible and enjoyable for developers worldwide.
