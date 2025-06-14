# AI Interview Platform 🤖💼

An intelligent interview preparation platform powered by AI that helps candidates practice and improve their interview skills through realistic simulations, personalized feedback, and comprehensive analysis.

## 🌟 Features

### Core Functionality
- **AI-Powered Interviews**: Conduct realistic interview sessions with dynamic question generation
- **Resume Management**: Upload, parse, and analyze resumes with AI extraction
- **Job Description Processing**: Parse job descriptions to generate targeted interview questions
- **Real-time Feedback**: Get instant AI feedback on interview responses
- **Audio Analysis**: Advanced speech analysis including sentiment, pace, and filler word detection
- **Performance Analytics**: Comprehensive interview performance tracking and insights

### Advanced Capabilities
- **Multiple Interview Types**: Technical, behavioral, and mixed interview sessions
- **Difficulty Levels**: Customizable interview difficulty (Easy, Medium, Hard)
- **Smart Question Generation**: Context-aware questions based on resume and job requirements
- **Progress Tracking**: Detailed performance metrics and improvement suggestions

## 🛠 Tech Stack

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔄 Version History

- **v1.0.0** - Initial release with core interview features
- **v1.1.0** - Added audio analysis and advanced feedback
- **v1.2.0** - Enhanced UI/UX and performance improvements

