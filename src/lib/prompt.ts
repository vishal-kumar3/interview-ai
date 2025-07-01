import { InterviewFormData } from "@/schema/interview.schema";
import { JobDescriptionParseJsonSchema } from "@/schema/jobDescription.schema";
import { resumeParseJsonSchema, resumeReponseSchema } from "@/schema/resume.schema";
import { JobDescription, Resume } from "@prisma/client";

//! Resume
export const resumeParserPrompt = `
Extract resume information into structured JSON format with maximum accuracy.

**Rules:**
- Use 'null' for missing fields, empty arrays [] for missing lists
- Date format: "YYYY-MM" or "Month YYYY", "Present" for current roles
- Extract complete information, don't truncate
- Validate email/URL formats

**Extract:**
- Personal: name, email, phone, LinkedIn/GitHub/Portfolio URLs, location
- Experience: job titles, companies, dates, key responsibilities
- Education: degrees, majors, universities, graduation dates, GPA
- Skills: categorize by type (programming, frameworks, tools, databases, cloud, etc.)
- Projects: names, descriptions, technologies, URLs
- Certifications: names, organizations, dates
`

//! Job Description
export const jobDescriptionParserPrompt = `
Extract structured technical requirements from job descriptions for precise interview assessment.

**Extract & Prioritize Technical Information:**
- Technical Skills: Programming languages, frameworks, tools with specific versions and experience levels
- Experience: Years of technical experience required, project complexity, scale
- Technical Responsibilities: Implementation tasks, coding, architecture, testing
- Education: Technical degrees, certifications, equivalent experience options

**Skill Categories (Must Use Exactly):**
- TECHNICAL: Programming languages, frameworks, databases, tools, platforms, architecture
- SOFT_SKILL: Problem-solving, debugging, technical communication, code review
- DOMAIN_KNOWLEDGE: Industry-specific technical knowledge, business logic
- LEADERSHIP: Technical mentorship, code reviews, architecture decisions

**Requirement Types (Must Use Exactly):**
- MUST_HAVE: "Required", "Essential", core technologies
- NICE_TO_HAVE: "Preferred", "Plus", additional technologies
- DEAL_BREAKER: "Critical", "Non-negotiable", absolute requirements

**Proficiency Levels (Must Use Exactly):**
- BEGINNER: 0-1 years, basic understanding
- INTERMEDIATE: 1-3 years practical experience
- ADVANCED: 3-5 years, implementation expertise
- EXPERT: 5+ years, deep technical knowledge

**Weight System (1-10):**
- 9-10: Core technical skills (main programming languages, frameworks)
- 7-8: Important secondary skills (databases, cloud platforms)
- 5-6: Helpful technical skills (testing frameworks, CI/CD)
- 3-4: Nice-to-have technologies
- 1-2: Minor technical preferences

**Priority Levels for Responsibilities (Must Use Exactly):**
- PRIMARY: Core coding and technical tasks
- SECONDARY: Supporting technical activities
- OPTIONAL: Occasional technical responsibilities

**Complexity Levels (Must Use Exactly):**
- HIGH: Advanced technical challenges, architecture design
- MEDIUM: Standard implementation complexity
- LOW: Routine technical tasks

**Technical Focus:**
- Extract specific versions of technologies (e.g., "React 18+", "Python 3.9+")
- Note years of experience required for each technology
- Identify technical implementation responsibilities
- Determine technical problem complexity
- Focus on interview-assessable technical skills

**Output Format:** Generate structured JSON that precisely follows the schema with accurate technical assessment data suitable for interview preparation.
`

export const jobDescriptionGeneratePrompt = `
Create a technical-focused job description optimized for skills assessment and interview preparation.

**Structure Requirements:**

1. **Job Overview (2-3 sentences):**
   - Core technical responsibilities and impact
   - Primary technology stack and architecture
   - Technical challenges and problem-solving focus

2. **Required Technical Skills (Be Extremely Specific):**
   - Programming Languages: With years and proficiency (e.g., "Python (3+ years, Advanced)", "JavaScript ES6+ (Expert level)")
   - Frameworks & Libraries: Versions and depth (e.g., "React 18+ with Hooks", "Django REST Framework 3.x", "Spring Boot 2.7+")
   - Databases: Specific technologies and skills (e.g., "PostgreSQL (complex queries, indexing)", "Redis (caching strategies)", "MongoDB (aggregation pipelines)")
   - Development Tools: Proficiency required (e.g., "Git (branching strategies)", "Docker (container orchestration)", "Jenkins (CI/CD pipelines)")
   - Cloud Platforms: Specific services (e.g., "AWS (EC2, RDS, S3, Lambda)", "Azure (App Service, SQL Database)", "GCP (Compute Engine, Cloud Functions)")
   - Testing: Frameworks and approaches (e.g., "Jest (unit testing)", "Cypress (E2E testing)", "TDD methodology")

3. **Preferred Technical Skills:**
   - Advanced frameworks and tools
   - Emerging technologies relevant to role
   - Performance optimization techniques
   - Architecture patterns and design principles

4. **Core Technical Responsibilities:**
   - Software development and coding tasks
   - System design and architecture decisions
   - Code review and quality assurance
   - Performance optimization and debugging
   - Database design and query optimization
   - API development and integration
   - Testing strategy and implementation
   - Deployment and DevOps practices

5. **Experience Requirements:**
   - Total years in software development
   - Years with specific technologies
   - Project complexity handled (e.g., "high-traffic applications", "distributed systems")
   - Scale of applications worked on (e.g., "10k+ users", "microservices architecture")

6. **Technical Challenges You'll Solve:**
   - Specific problems the role addresses
   - Performance and scalability challenges
   - Integration and system design challenges
   - Technical debt and optimization opportunities

**Writing Guidelines:**
- Focus 80% on technical skills and responsibilities
- Use specific technology versions and requirements
- Include measurable experience levels (years, scale, complexity)
- Emphasize hands-on coding and technical problem-solving
- Make every requirement testable in an interview setting
- Avoid generic soft skills unless directly technical (e.g., "technical communication")

**Optimization for Assessment:**
- Each skill should be interview-assessable
- Include specific technologies that can be tested
- Focus on practical, hands-on experience
- Structure for easy technical question generation
- Emphasize real-world problem-solving scenarios

**Output:** Technical job description focused on assessable skills, coding expertise, and technical problem-solving capabilities.
`

//! Interview
export const interviewGuidePrompt = (data: InterviewFormData, jobDescription: JobDescription, resume: Resume) => {
  const jobParsedData = JobDescriptionParseJsonSchema.parse(jobDescription.parsedData)
  const resumeParsedData = resumeParseJsonSchema.parse(resume.parsedData)

  return `
You are an expert ${jobDescription.title} interviewer conducting a ${data.difficulty} ${data.interviewType} interview.

**JOB REQUIREMENTS:**
- Position: ${jobDescription.title}
- Must-Have Skills: ${jobParsedData.skillRequirements.filter(s => s.requirementType === "MUST_HAVE").map(s => s.name).join(", ")}
- Key Responsibilities: ${jobParsedData.responsibilities.filter(r => r.priority == 'PRIMARY').map(r => r.description).join(", ")}

**CANDIDATE BACKGROUND:**
- Name: ${resumeParsedData.personal_details?.name ?? "N/A"}
- work_experience: ${resumeParsedData.work_experience?.map(exp => `${exp.job_title ?? "N/A"} at ${exp.company_name ?? "N/A"} (${exp.start_date ?? "N/A"} - ${exp.end_date ?? "N/A"})`).join(", ") ?? "none"}
- projects: ${resumeParsedData.projects?.map(proj => `${proj.project_name ?? "N/A"}${proj.project_url ? ` (${proj.project_url})` : ""}`).join(", ") ?? "none"}
- skills: ${[
      ...(resumeParsedData.skills?.programming_languages ?? []),
      ...(resumeParsedData.skills?.frameworks_libraries ?? []),
      ...(resumeParsedData.skills?.databases ?? []),
      ...(resumeParsedData.skills?.tools ?? []),
      ...(resumeParsedData.skills?.cloud_platforms ?? []),
      ...(resumeParsedData.skills?.operating_systems ?? []),
      ...(resumeParsedData.skills?.other_skills ?? [])
    ].join(", ") || "none"}
- education: ${resumeParsedData.education?.map(edu => `${edu.degree ?? "N/A"} in ${edu.major ?? "N/A"} from ${edu.university ?? "N/A"} (${edu.graduation_date ?? "N/A"})`).join(", ") ?? "none"}
- certifications: ${resumeParsedData.certifications?.map(cert => `${cert.certification_name ?? "N/A"} from ${cert.issuing_organization ?? "N/A"}`).join(", ") ?? "none"}
- achievements: ${resumeParsedData.achievements?.map(ach => `${ach.name ?? "N/A"} from ${ach.issuing_organization ?? "N/A"}`).join(", ") ?? "none"}
${data.notes ? `Focus Areas: ${data.notes}` : ""}

**INTERVIEW APPROACH:**
1. **Resume-First Strategy:** Ask about specific projects/experiences that align with job requirements
2. **Technical Depth:** Probe implementation details, challenges faced, solutions used
3. **Adaptive Difficulty:** Increase complexity for strong answers, provide guidance for weak ones
4. **STAR Method:** Encourage Situation, Task, Action, Result responses

**QUESTION GUIDELINES:**
- Start with candidate's most relevant project/experience
- Ask about specific technologies and implementations they've used
- Explore problem-solving approach and decision-making
- Assess both technical skills and collaboration abilities
- Focus on real experience, avoid hypothetical scenarios

**FOLLOW-UP RULES:**
- Ask follow-ups ONLY for generic/shallow responses
- Maximum 2-3 follow-ups per question
- Move on if answers remain generic after follow-ups
- Probe for: "How did you implement X?", "What challenges did you face?", "What would you do differently?"

**BOUNDARIES:**
- Questions must relate to job requirements AND candidate experience
- No questions about technologies not in their resume or job description
- Maintain professional, encouraging tone
- Focus on understanding thought process over perfect answers

Conduct a thorough assessment while providing a positive interview experience.
`
}

export const initialQuestionPrompt = `
Generate the first interview question using ACTUAL specific details from the candidate's resume and job requirements.

**CRITICAL: Use Real Data, Not Placeholders**
- Use the actual project name (e.g., "your e-commerce platform" not "[specific project]")
- Use the actual technology (e.g., "React and Node.js" not "[technology]")
- Use the actual company name (e.g., "at Microsoft" not "[company]")
- Reference specific details from their resume

**Question Strategy:**
- Choose the most relevant project/experience that aligns with job requirements
- Reference specific project names, technologies, or companies from their background
- Use open-ended format: "Tell me about..." or "Walk me through..."
- Focus on recent projects (last 2-3 years) that demonstrate must-have skills

**Example Good Questions:**
- "I see you built a React-based dashboard at TechCorp that handled real-time data. Walk me through your approach to managing state and handling performance challenges."
- "Tell me about your microservices architecture project using Docker and Kubernetes. What were the main scalability challenges you solved?"
- "I noticed your machine learning project for fraud detection using Python and TensorFlow. How did you approach the data preprocessing and model selection?"

**Example Bad Questions (Avoid These):**
- "Tell me about your experience with [technology]"
- "Walk me through [specific project]"
- "Can you describe your work at [company]"

**Requirements:**
- Must use actual names/technologies from candidate's resume
- Must relate to job requirements
- Must be specific and engaging
- No placeholders or generic references

**Required Output:**
- Question: [Specific question using actual resume data]
- Reasoning: [Why this specific project/technology was chosen and what competencies it assesses]
`

export const nextQuestionPrompt = `
Based on the candidate's response, determine the next interview step using SPECIFIC details from their background.

**CRITICAL: Use Real Data, Not Placeholders**
- Reference actual project names, technologies, and companies from their resume
- Build upon specific details mentioned in previous responses
- No generic placeholders like "[technology]" or "[project]"

**Response Assessment:**
- **Strong Response:** Detailed, specific → Move to next topic or increase complexity
- **Generic Response:** Lacks depth → Ask targeted follow-up with specific details
- **Weak Response:** Knowledge gaps → Provide guidance or pivot to their stronger areas

**Follow-Up Examples (Use Actual Data):**
Instead of: "Can you dive deeper into the technical implementation of X?"
Use: "You mentioned using Redis for caching in your e-commerce project. Can you walk me through how you handled cache invalidation and data consistency?"

Instead of: "What challenges did you face with Y?"
Use: "With your Node.js API that you built at StartupXYZ, what were the specific performance bottlenecks you encountered when scaling to handle 10k+ concurrent users?"

**Transition Examples (Use Actual Data):**
- Move to different specific project from their resume
- Reference actual technologies they've used
- Build on previous technical discussions with specific follow-ups

**Guidelines:**
- Questions must use actual project names and technologies from their resume
- Build upon specific details from previous answers
- Reference actual companies, tools, and implementations mentioned
- Maintain encouraging tone regardless of response quality
- Focus on understanding their actual experience

**Required Output:**
- Decision: [Follow-up, Transition, Clarification, or End Interview]
- Question: [Specific question using actual resume/response data, or "End Interview"]
- Reasoning: [Why this approach targets specific competencies based on their actual background]
`
