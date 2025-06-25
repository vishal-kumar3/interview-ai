# Interview AI 🤖💼

An intelligent AI-powered interview preparation platform that helps candidates practice and improve their interview skills through realistic simulations, personalized feedback, and comprehensive performance analytics.

## 📖 Overview

Interview AI is a comprehensive interview preparation platform that leverages artificial intelligence to create realistic interview experiences. The platform analyzes your resume and target job descriptions to generate personalized interview questions, provides real-time feedback on your responses, and tracks your progress over time.

## ✨ Key Features

### 🎯 Smart Interview System
- **AI-Powered Question Generation**: Dynamic questions based on your resume and job requirements
- **Multiple Interview Types**: Technical, Behavioral, and Situational interviews
- **Adaptive Difficulty**: Beginner, Intermediate, and Advanced levels
- **Follow-up Questions**: Intelligent follow-up questions based on your responses
- **Real-time Audio Recording**: High-quality audio capture with visual feedback

### 📄 Document Management
- **Resume Parser**: AI-powered resume analysis and skill extraction
- **Job Description Analysis**: Intelligent parsing of job requirements and responsibilities
- **Document Storage**: Secure cloud storage with AWS S3 integration
- **Multiple Format Support**: PDF parsing and text extraction

### 📊 Performance Analytics
- **Detailed Feedback**: AI-generated feedback on each response
- **Performance Scoring**: Comprehensive scoring system with improvement suggestions
- **Progress Tracking**: Historical performance data and trend analysis
- **Hire Recommendations**: AI assessment with hiring recommendations
- **Strengths & Weaknesses**: Detailed analysis of your interview performance

### 🔐 Authentication & Security
- **NextAuth.js Integration**: Secure authentication with multiple providers
- **Email Verification**: Account verification system
- **Password Reset**: Secure password recovery
- **Role-based Access**: User and admin role management

### 🎨 User Experience
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Live feedback and progress indicators
- **Audio Playback**: Review your recorded responses
- **Dashboard Analytics**: Comprehensive overview of your interview history

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Backend & Database
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication system
- **Redis** - Caching and session management

### AI & ML
- **Google Gemini AI** - Text generation and analysis
- **PDF Processing** - Resume and job description parsing
- **Audio Processing** - Speech-to-text transcription

### Cloud Services
- **AWS S3** - File storage
- **Vercel** - Deployment platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Redis instance
- Google Gemini AI API key
- AWS S3 credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd interview-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/interview_ai"

# Authentication
AUTH_SECRET="your-auth-secret"
AUTH_TRUST_HOST="http://localhost:3000"

# OAuth Providers
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"
AUTH_GOOGLE_CLIENT_ID="your-google-client-id"
AUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-s3-bucket"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (Optional)
NODEMAILER_EMAIL="your-email@example.com"
NODEMAILER_PASS="your-email-password"

# App Configuration
WEB_NAME="AI Interview Platform"
```

4. **Service Via Docker**
```bash
docker compose up # -d flag to run service in background
```

5. **Database Setup**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# (Optional) Open Prisma Studio
npm run prisma:studio
```

5. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the application.

## 📁 Project Structure

```
src/
├── actions/           # Server actions for data operations
├── app/              # Next.js App Router pages
├── auth/             # Authentication configuration
├── components/       # Reusable UI components
├── config/           # Database and service configurations
├── lib/              # Utility libraries and helpers
├── schema/           # Zod validation schemas
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate:dev    # Run database migrations
npm run prisma:migrate:deploy # Deploy migrations (production)
npm run prisma:studio    # Open Prisma Studio
npm run prisma:db:push   # Push schema to database

# Build & Deploy
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

## 🏗 Architecture Overview

### Authentication Flow
- Multi-provider OAuth (GitHub, Google)
- Secure session management with NextAuth.js
- Protected routes and API endpoints

### AI Integration
- **Resume Parsing**: Extract structured data from PDF resumes
- **Job Description Analysis**: Parse requirements and generate questions
- **Interview Simulation**: Dynamic conversation flow with context awareness
- **Feedback Generation**: Comprehensive performance analysis

### Data Flow
1. User uploads resume/job description
2. AI processes and extracts relevant information
3. System generates targeted interview questions
4. Real-time interview simulation with audio processing
5. AI provides detailed feedback and suggestions

## 🔐 Security

- Environment variable validation
- Input sanitization with Zod schemas
- Secure file upload with type validation
- Protected API routes with authentication
- SQL injection prevention with Prisma

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Configure environment variables

2. **Database Setup**
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations: `npm run prisma:migrate:deploy`

3. **Environment Configuration**
   - Set all required environment variables
   - Configure custom domains if needed

### Manual Deployment

1. **Build Application**
```bash
npm run build
```

2. **Deploy to Platform**
   - Upload build files
   - Configure environment variables
   - Set up database and Redis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an [issue](https://github.com/your-repo/issues)
- Check the [documentation](https://your-docs-link.com)
- Join our [community](https://your-community-link.com)

## 🔄 Version History

- **v1.0.0** - Initial release with core interview features
- **v1.1.0** - Added audio analysis and advanced feedback
- **v1.2.0** - Enhanced UI/UX and performance improvements

---

Built with ❤️ using Next.js and AI technologies
