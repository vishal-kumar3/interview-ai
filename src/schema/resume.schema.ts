

import { z } from 'zod';

// Define the schema for personal details
const personalDetailsSchema = z.object({
  name: z.string().nullable(),
  email: z.string().email().nullable(), // Added .email() for basic email validation
  contact_number: z.string().nullable(),
  linkedin_profile: z.string().url().nullable(), // Added .url() for basic URL validation
  portfolio_website: z.string().url().nullable(), // Added .url() for basic URL validation
  location: z.string().nullable(),
}).partial(); // .partial() makes all fields optional initially, then we can refine if needed.
// For a resume parser, it's safer to assume fields might be missing.

// Define the schema for a single work experience entry
const workExperienceSchema = z.object({
  job_title: z.string().nullable(),
  company_name: z.string().nullable(),
  location: z.string().nullable(),
  start_date: z.string().nullable(), // Consider refining with a custom date validation if needed
  end_date: z.string().nullable(),   // to ensure YYYY-MM or "Present" format
  responsibilities: z.array(z.string()).nullable(),
}).partial();

// Define the schema for a single education entry
const educationSchema = z.object({
  degree: z.string().nullable(),
  major: z.string().nullable(),
  university: z.string().nullable(),
  location: z.string().nullable(),
  graduation_date: z.string().nullable(), // Consider refining with a custom date validation
  gpa: z.string().nullable(),
}).partial();

// Define the schema for the skills section
const skillsSchema = z.object({
  programming_languages: z.array(z.string()).nullable(),
  frameworks_libraries: z.array(z.string()).nullable(),
  databases: z.array(z.string()).nullable(),
  tools: z.array(z.string()).nullable(),
  cloud_platforms: z.array(z.string()).nullable(),
  operating_systems: z.array(z.string()).nullable(),
  other_skills: z.array(z.string()).nullable(),
}).partial();

// Define the schema for a single project entry
const projectSchema = z.object({
  project_name: z.string().nullable(),
  description: z.string().nullable(),
  technologies_used: z.array(z.string()).nullable(),
  project_url: z.string().url().nullable(), // Added .url()
}).partial();

// Define the schema for a single certification entry
const certificationSchema = z.object({
  certification_name: z.string().nullable(),
  issuing_organization: z.string().nullable(),
  date_obtained: z.string().nullable(), // Consider refining with a custom date validation
}).partial();

// Define the schema for a single award/honor entry
const achievementsSchema = z.object({
  name: z.string().nullable(),
  issuing_organization: z.string().nullable(),
  description: z.string().nullable(), // Consider refining with a custom date validation
}).partial();

// Define the main resume schema
export const resumeParseJsonSchema = z.object({
  personal_details: personalDetailsSchema.nullable(),
  summary_or_objective: z.string().nullable(),
  work_experience: z.array(workExperienceSchema).nullable(),
  education: z.array(educationSchema).nullable(),
  skills: skillsSchema.nullable(),
  projects: z.array(projectSchema).nullable(),
  certifications: z.array(certificationSchema).nullable(),
  achievements: z.array(achievementsSchema).nullable(),
  languages: z.array(z.string()).nullable(),
});

export type ResumeParseJson = z.infer<typeof resumeParseJsonSchema>;
