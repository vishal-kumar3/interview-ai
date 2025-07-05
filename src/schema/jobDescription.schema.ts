import { z } from "zod";
import { SchemaUnion, Type } from '@google/genai'

// Simplified Enums
const SkillCategoryEnum = z.enum([
  'TECHNICAL',
  'SOFT_SKILL',
  'DOMAIN_KNOWLEDGE',
  'LEADERSHIP'
]);

const ProficiencyLevelEnum = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT'
]);

const RequirementTypeEnum = z.enum([
  'MUST_HAVE',
  'NICE_TO_HAVE',
  'DEAL_BREAKER'
]);

const JobLevelEnum = z.enum([
  'ENTRY',
  'MID',
  'SENIOR',
  'PRINCIPAL'
]);

const PriorityEnum = z.enum([
  'PRIMARY',
  'SECONDARY',
  'OPTIONAL'
]);

// Simplified Skill Requirement
const SkillRequirementSchema = z.object({
  name: z.string(),
  category: SkillCategoryEnum,
  requiredLevel: ProficiencyLevelEnum,
  requirementType: RequirementTypeEnum,
  keywords: z.array(z.string()),
  minYearsExperience: z.number().default(0),
  weight: z.number().min(1).max(10).default(5)
});

// Simplified Experience Requirement
const ExperienceRequirementSchema = z.object({
  totalYearsRequired: z.number(),
  preferredYears: z.number().optional(),
  relevantIndustries: z.array(z.string()).default([]),
  leadershipRequired: z.boolean().default(false),
  teamSizeManaged: z.number().optional()
});

// Simplified Education Requirement
const EducationRequirementSchema = z.object({
  degreeRequired: z.boolean().default(false),
  preferredDegreeLevel: z.enum(['BACHELOR', 'MASTER', 'PHD']).optional(),
  relevantFields: z.array(z.string()).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    required: z.boolean(),
    weight: z.number().min(1).max(10).default(5)
  })).default([]),
  equivalentExperienceAccepted: z.boolean().default(true)
});

// Simplified Responsibilities
const ResponsibilitySchema = z.object({
  description: z.string(),
  priority: PriorityEnum,
  skillsRequired: z.array(z.string()),
  complexityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
});

// Simplified Job Info
const JobInfoSchema = z.object({
  title: z.string(),
  department: z.string().optional(),
  jobLevel: JobLevelEnum,
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).default('FULL_TIME'),
  remotePolicy: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional()
});

// Main Optimized Schema
export const JobDescriptionParseJsonSchema = z.object({
  jobInfo: JobInfoSchema,
  skillRequirements: z.array(SkillRequirementSchema),
  experienceRequirements: ExperienceRequirementSchema,
  educationRequirements: EducationRequirementSchema,
  responsibilities: z.array(ResponsibilitySchema)
});

export type JobDescriptionParseJson = z.infer<typeof JobDescriptionParseJsonSchema>;

export const jobDescriptionResponseSchema: SchemaUnion = {
  "type": Type.OBJECT,
  "properties": {
    "jobInfo": {
      "type": Type.OBJECT,
      "properties": {
        "title": { "type": Type.STRING },
        "department": { "type": Type.STRING },
        "jobLevel": {
          "type": Type.STRING,
          "enum": ["ENTRY", "MID", "SENIOR", "PRINCIPAL"]
        },
        "employmentType": {
          "type": Type.STRING,
          "enum": ["FULL_TIME", "PART_TIME", "CONTRACT"]
        },
        "remotePolicy": {
          "type": Type.STRING,
          "enum": ["REMOTE", "HYBRID", "ONSITE"]
        }
      },
      "required": ["title", "jobLevel"]
    },
    "skillRequirements": {
      "type": Type.ARRAY,
      "items": {
        "type": Type.OBJECT,
        "properties": {
          "name": { "type": Type.STRING },
          "category": {
            "type": Type.STRING,
            "enum": ["TECHNICAL", "SOFT_SKILL", "DOMAIN_KNOWLEDGE", "LEADERSHIP"]
          },
          "requiredLevel": {
            "type": Type.STRING,
            "enum": ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]
          },
          "requirementType": {
            "type": Type.STRING,
            "enum": ["MUST_HAVE", "NICE_TO_HAVE", "DEAL_BREAKER"]
          },
          "keywords": {
            "type": Type.ARRAY,
            "items": { "type": Type.STRING }
          },
          "minYearsExperience": { "type": Type.NUMBER },
          "weight": { "type": Type.NUMBER }
        },
        "required": ["name", "category", "requiredLevel", "requirementType", "keywords"]
      }
    },
    "experienceRequirements": {
      "type": Type.OBJECT,
      "properties": {
        "totalYearsRequired": { "type": Type.NUMBER },
        "preferredYears": { "type": Type.NUMBER },
        "relevantIndustries": {
          "type": Type.ARRAY,
          "items": { "type": Type.STRING }
        },
        "leadershipRequired": { "type": Type.BOOLEAN },
        "teamSizeManaged": { "type": Type.NUMBER }
      },
      "required": ["totalYearsRequired"]
    },
    "educationRequirements": {
      "type": Type.OBJECT,
      "properties": {
        "degreeRequired": { "type": Type.BOOLEAN },
        "preferredDegreeLevel": {
          "type": Type.STRING,
          "enum": ["BACHELOR", "MASTER", "PHD"]
        },
        "relevantFields": {
          "type": Type.ARRAY,
          "items": { "type": Type.STRING }
        },
        "certifications": {
          "type": Type.ARRAY,
          "items": {
            "type": Type.OBJECT,
            "properties": {
              "name": { "type": Type.STRING },
              "required": { "type": Type.BOOLEAN },
              "weight": { "type": Type.NUMBER }
            },
            "required": ["name", "required"]
          }
        },
        "equivalentExperienceAccepted": { "type": Type.BOOLEAN }
      },
      "required": ["degreeRequired"]
    },
    "responsibilities": {
      "type": Type.ARRAY,
      "items": {
        "type": Type.OBJECT,
        "properties": {
          "description": { "type": Type.STRING },
          "priority": {
            "type": Type.STRING,
            "enum": ["PRIMARY", "SECONDARY", "OPTIONAL"]
          },
          "skillsRequired": {
            "type": Type.ARRAY,
            "items": { "type": Type.STRING }
          },
          "complexityLevel": {
            "type": Type.STRING,
            "enum": ["LOW", "MEDIUM", "HIGH"]
          }
        },
        "required": ["description", "priority", "skillsRequired"]
      }
    }
  },
  "required": ["jobInfo", "skillRequirements", "experienceRequirements", "educationRequirements", "responsibilities"]
}
