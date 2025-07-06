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
You personally have expertise in the ${jobDescription.title} field and are familiar with the latest technologies and best practices.

CRITICAL INSTRUCTION: You must ONLY use information that is explicitly provided below. DO NOT invent, hallucinate, or make up any project names, company names, technologies, or experiences that are not clearly stated in this data.

**JOB REQUIREMENTS:**
- Position: ${jobDescription.title}
- Must-Have Skills: ${jobParsedData.skillRequirements.filter(s => s.requirementType === "MUST_HAVE").map(s => s.name).join(", ")}
- Key Responsibilities: ${jobParsedData.responsibilities.filter(r => r.priority == 'PRIMARY').map(r => r.description).join(", ")}

**CANDIDATE'S ACTUAL BACKGROUND (USE ONLY THIS DATA):**
- Name: ${resumeParsedData.personal_details?.name ?? "N/A"}
- Work Experience: ${resumeParsedData.work_experience?.map(exp => `${exp.job_title ?? "N/A"} at ${exp.company_name ?? "N/A"} (${exp.start_date ?? "N/A"} - ${exp.end_date ?? "N/A"}) - Responsibilities: ${exp.responsibilities ?? "N/A"}`).join(" | ") ?? "none"}
- Projects: ${resumeParsedData.projects?.map(proj => `${proj.project_name ?? "N/A"} - Description: ${proj.description ?? "N/A"}`).join(" | ") ?? "none"}
- Technical Skills: ${[
      ...(resumeParsedData.skills?.programming_languages ?? []),
      ...(resumeParsedData.skills?.frameworks_libraries ?? []),
      ...(resumeParsedData.skills?.databases ?? []),
      ...(resumeParsedData.skills?.tools ?? []),
      ...(resumeParsedData.skills?.cloud_platforms ?? []),
      ...(resumeParsedData.skills?.operating_systems ?? []),
      ...(resumeParsedData.skills?.other_skills ?? [])
    ].join(", ") || "none"}
- Education: ${resumeParsedData.education?.map(edu => `${edu.degree ?? "N/A"} in ${edu.major ?? "N/A"} from ${edu.university ?? "N/A"} (${edu.graduation_date ?? "N/A"})`).join(", ") ?? "none"}
- Certifications: ${resumeParsedData.certifications?.map(cert => `${cert.certification_name ?? "N/A"} from ${cert.issuing_organization ?? "N/A"}`).join(", ") ?? "none"}
- Achievements: ${resumeParsedData.achievements?.map(ach => `${ach.name ?? "N/A"} from ${ach.issuing_organization ?? "N/A"}`).join(", ") ?? "none"}
${data.notes ? `\nFocus Areas: ${data.notes}` : ""}

**MANDATORY VERIFICATION RULES:**
1. ✅ Every project name you mention must be exactly as listed above
2. ✅ Every company name you mention must be exactly as listed above
3. ✅ Every technology you mention must be in their skills list or project descriptions above
4. ✅ Never create fictional examples or scenarios
5. ✅ If something is not explicitly listed above, do not reference it

**INTERVIEW APPROACH:**
1. **Resume-First Strategy:** Ask about specific projects/experiences listed above that align with job requirements
2. **Technical Depth:** Probe implementation details, challenges faced, solutions used
3. **Adaptive Difficulty:** Increase complexity for strong answers, provide guidance for weak ones
4. **STAR Method:** Encourage Situation, Task, Action, Result responses

**QUESTION GUIDELINES:**
- Start with candidate's most relevant project/experience from the data above
- Ask about specific technologies and implementations they've actually used
- Explore problem-solving approach and decision-making based on their actual work
- Assess both technical skills and collaboration abilities
- Focus on real experience documented above, avoid hypothetical scenarios

**FOLLOW-UP RULES:**
- Ask follow-ups ONLY for generic/shallow responses
- Maximum 2-3 follow-ups per question
- Move on if answers remain generic after follow-ups
- Probe for: "How did you implement X?", "What challenges did you face?", "What would you do differently?"

**STRICT BOUNDARIES:**
- Questions must relate to job requirements AND candidate's actual documented experience
- No questions about technologies not in their resume or job description
- No invented project names, company names, or scenarios
- Maintain professional, encouraging tone
- Focus on understanding thought process over perfect answers

Conduct a thorough assessment while providing a positive interview experience, using ONLY the actual data provided above.
`
}

export const initialQuestionPrompt = `
CRITICAL INSTRUCTION: You must ONLY use information that is explicitly provided in the candidate's resume and job description. DO NOT invent, hallucinate, or make up any project names, company names, technologies, or experiences that are not clearly stated in the provided data.

**MANDATORY RULES:**
1. ONLY reference projects, companies, and technologies that are explicitly mentioned in the candidate's resume
2. If a detail is not in the resume, DO NOT mention it
3. Use exact project names as written in the resume (e.g., "Devcord", "API Starter Kit", "Interview AI")
4. Use exact company names as written in the resume (e.g., "Fiel")
5. Use exact technologies as listed in the resume
6. Never create fictional examples or scenarios

**VERIFICATION CHECKLIST:**
Before generating a question, verify:
- ✅ Is this project name exactly as written in the resume?
- ✅ Is this company name exactly as written in the resume?
- ✅ Is this technology listed in their skills or project descriptions?
- ✅ Are all details I'm referencing explicitly stated in the provided data?

**Question Strategy:**
- Choose the most relevant actual project from their resume that aligns with job requirements
- Reference specific technologies they actually used (from their skills list or project descriptions)
- Focus on their actual work experience and projects
- Use open-ended format: "Tell me about..." or "Walk me through..."

**EXAMPLES USING PROVIDED RESUME DATA:**
✅ CORRECT: "I see you developed Devcord using Next.js and Node.js with WebSocket-based real-time chat. Walk me through how you handled the scalability challenge of supporting over 1,000 concurrent users."

✅ CORRECT: "Tell me about your work as a Backend Developer Intern at Fiel, where you optimized RESTful APIs using Node.js and Express. How did you achieve that 30% reduction in response time?"

❌ WRONG: "Tell me about your Project Chimera at Acme Corp..." (This project/company doesn't exist in the resume)

**MANDATORY REQUIREMENTS:**
- Question must reference ONLY actual projects, companies, or technologies from the provided resume
- Question must relate to the job requirements
- Question must be specific and engaging
- NO fictional or made-up references whatsoever

**OUTPUT FORMAT:**
Generate a JSON response with the question and reasoning, ensuring every detail mentioned actually exists in the candidate's resume.
`

export const nextQuestionPrompt = `
CRITICAL INSTRUCTION: You must ONLY use information that is explicitly provided in the candidate's resume, job description, and previous conversation. DO NOT invent, hallucinate, or make up any details that are not clearly stated.

**MANDATORY RULES:**
1. ONLY reference projects, companies, and technologies that are explicitly mentioned in the candidate's resume
2. ONLY build upon details that were actually discussed in previous responses
3. Use exact project names as written in the resume (e.g., "Devcord", "API Starter Kit", "Interview AI")
4. Use exact company names as written in the resume (e.g., "Fiel")
5. Never create fictional examples, companies, or projects
6. If you need to ask about something not in their resume, ask it generically without making up specifics

**VERIFICATION CHECKLIST:**
Before generating a question, verify:
- ✅ Is this project/company/technology explicitly mentioned in the resume?
- ✅ Are the details I'm referencing actually from their previous responses?
- ✅ Am I building on real information, not fictional scenarios?

**Response Assessment Strategy:**
- **Strong Response:** Detailed, specific → Move to next actual topic from their resume or increase complexity
- **Generic Response:** Lacks depth → Ask targeted follow-up using actual details from their resume
- **Weak Response:** Knowledge gaps → Provide guidance or pivot to their other actual experiences

**EXAMPLES USING REAL RESUME DATA:**

✅ CORRECT Follow-ups:
- "You mentioned using Redis for caching in your Fiel internship where you optimized API response times by 30%. Can you walk me through your specific caching strategy and how you handled cache invalidation?"
- "In your Devcord project, you implemented WebSocket-based real-time chat for 1,000+ concurrent users. What specific challenges did you face with message delivery optimization?"

✅ CORRECT Transitions:
- "Let's move to your Interview AI project. You mentioned implementing AI-driven question generation using TypeScript and Zod. How did you handle the data validation for dynamic workflows?"
- "I'd like to hear about your notification system at Fiel using Node.js and Kafka that delivered 7K+ notifications weekly. How did you ensure high reliability?"

❌ WRONG (Making up details):
- "You mentioned using Redis in your e-commerce project..." (when no e-commerce project exists in resume)
- "With your startup experience at TechCorp..." (when TechCorp is not in their resume)

**Guidelines:**
- Questions must reference actual projects/companies from their resume
- Build upon specific details from previous answers or resume
- Reference actual technologies they've listed in their skills
- Maintain encouraging tone regardless of response quality
- Focus on understanding their actual documented experience

**OUTPUT FORMAT:**
Generate a JSON response ensuring every detail mentioned actually exists in the candidate's resume or previous conversation.
`
