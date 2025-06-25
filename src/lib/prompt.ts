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
- Personal: name, email, phone, LinkedIn/GitHub URLs, location
- Experience: job titles, companies, dates, key responsibilities
- Education: degrees, majors, universities, graduation dates, GPA
- Skills: categorize by type (programming, frameworks, tools, databases, cloud, etc.)
- Projects: names, descriptions, technologies, URLs
- Certifications: names, organizations, dates

**Output:** Valid JSON matching the schema below.

${resumeReponseSchema}
`

//! Job Description
export const jobDescriptionParserPrompt = `
Extract structured requirements from job descriptions for precise candidate matching.

**Extract & Categorize:**
- Skills: technical (languages, frameworks, tools), soft skills, domain expertise
- Experience: years required, industry background, leadership needs
- Education: degree requirements, certifications, alternatives
- Responsibilities: focus on skill-indicating tasks only

**Skill Categories:**
- TECHNICAL_HARD: Programming, frameworks, databases, tools
- TECHNICAL_SOFT: Problem-solving, debugging, architecture
- DOMAIN_SPECIFIC: Industry knowledge, business processes
- LEADERSHIP: Team management, mentoring
- COMMUNICATION: Presentation, documentation
- ANALYTICAL: Data analysis, research, metrics
- CREATIVE: Design, innovation, UX
- OPERATIONAL: Process improvement, deployment

**Requirement Types:**
- MUST_HAVE: "Required", "Essential", "Mandatory"
- NICE_TO_HAVE: "Preferred", "Plus", "Bonus"
- DEAL_BREAKER: "Critical", "Non-negotiable"

**Proficiency Levels:**
- BEGINNER: Basic understanding
- INTERMEDIATE: 1-3 years practical experience
- ADVANCED: 3-5 years, can mentor others
- EXPERT: 5+ years, thought leadership
- MASTER: 8+ years, industry recognition

**Output:** Structured JSON with accurate categorization, requirement priorities, and interview-ready topics.
`

export const jobDescriptionGeneratePrompt = `
Create an engaging, skills-focused job description that attracts top talent.

**Structure:**
1. **Job Overview (2-3 sentences):** Role impact, key technologies, growth opportunities
2. **Core Skills:** Technical skills, soft skills, domain expertise (use bullet points)
3. **Required Qualifications:** Education, experience, certifications, essential skills
4. **Preferred Qualifications:** Bonus skills, advanced experience, industry background

**Guidelines:**
- Use action-oriented, inclusive language
- Be specific about skill levels and experience
- Balance technical requirements with soft skills
- Make role challenging yet achievable
- Use clear headers and bullet points

**Output:** Professional plain text, no JSON formatting.
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
Generate the first interview question that engages the candidate and assesses relevant skills.

**Strategy:**
- Choose the most relevant project/experience from their resume that aligns with job requirements
- Reference specific project names, technologies, or companies from their background
- Use open-ended format: "Tell me about..." or "Walk me through..."
- Focus on recent projects (last 2-3 years) that demonstrate must-have skills

**Question Patterns:**
- "I see you worked on [specific project] using [technology]. Walk me through your role and the challenges you faced."
- "Tell me about your experience with [technology] at [company]. What was the most complex problem you solved?"
- "I noticed [specific experience]. Can you describe how you approached [relevant challenge]?"

**Avoid:**
- Generic questions not tied to their specific experience
- Technologies not in their resume or job requirements
- Broad questions that could apply to any candidate

**Required Output:**
Generate a specific, engaging question based on their actual resume and job requirements, AND include the reasoning behind why you're asking this particular question.

**Format:**
- Question: [The actual interview question]
- Reasoning: [Why this question was chosen - what skills/competencies it will assess, why it's relevant to both the role and candidate's background]
`

export const nextQuestionPrompt = `
Based on the candidate's response, determine the next interview step.

**Response Assessment:**
- **Strong Response:** Detailed, specific → Move to next topic or increase complexity
- **Generic Response:** Lacks depth → Ask targeted follow-up
- **Weak Response:** Knowledge gaps → Provide guidance or pivot to stronger areas

**Follow-Up Decision:**
- **Ask Follow-Up When:** Response lacks technical depth, missing implementation details, no challenges mentioned
- **Move On When:** After 2-3 follow-ups with generic answers, sufficient depth achieved, time management needed
- **End Interview When:** Key competencies assessed, clear fit/no-fit determined

**Question Types:**

**Follow-Up (for depth):**
- "Can you dive deeper into the technical implementation?"
- "What specific challenges did you face and how did you solve them?"
- "What trade-offs did you consider?"

**Transition (new topics):**
- Move to different project/experience from resume
- Shift skill areas (technical → behavioral, individual → team)
- Increase complexity for strong performers

**Clarification:**
- "When you mentioned X, can you elaborate?"
- "What was your specific role in Y?"

**Guidelines:**
- Questions must relate to job requirements AND candidate experience
- Maintain encouraging tone regardless of response quality
- Build upon previous answers when appropriate
- Focus on understanding thought process

**Required Output:**
Generate the most appropriate next question or indicate if interview should conclude, AND include the reasoning behind your decision.

**Format:**
- Decision: [Follow-up, Transition, Clarification, or End Interview]
- Question: [The actual interview question, or "End Interview" if concluding]
- Reasoning: [Why this approach was chosen - what you're trying to assess, how it builds on previous responses, what competencies it targets]
`
