import { z } from "zod";
import { SchemaUnion, Type } from '@google/genai'

// Enums
const SkillCategoryEnum = z.enum([
  'TECHNICAL_HARD',
  'TECHNICAL_SOFT',
  'DOMAIN_SPECIFIC',
  'LEADERSHIP',
  'COMMUNICATION',
  'ANALYTICAL',
  'CREATIVE',
  'OPERATIONAL'
]);

const ProficiencyLevelEnum = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
  'MASTER'
]);

const RequirementTypeEnum = z.enum([
  'MUST_HAVE',
  'NICE_TO_HAVE',
  'PREFERRED',
  'DEAL_BREAKER'
]);

const AssessmentMethodEnum = z.enum([
  'TECHNICAL_TEST',
  'BEHAVIORAL_INTERVIEW',
  'PORTFOLIO_REVIEW',
  'CODE_REVIEW',
  'CASE_STUDY',
  'PRESENTATION',
  'REFERENCE_CHECK',
  'CERTIFICATION_VERIFICATION'
]);

// Skill Requirement
const SkillRequirementSchema = z.object({
  name: z.string(),
  category: SkillCategoryEnum,
  requiredLevel: ProficiencyLevelEnum,
  minimumYearsExperience: z.number(),
  requirementType: RequirementTypeEnum,
  keywords: z.array(z.string()),
  context: z.string().optional(),
  assessmentMethods: z.array(AssessmentMethodEnum),
  weight: z.number(),
  validationCriteria: z.object({
    portfolioRequired: z.boolean().optional(),
    certificationRequired: z.boolean().optional(),
    specificToolsVersions: z.array(z.string()).optional(),
    industryExperienceRequired: z.boolean().optional(),
    teamSizeManaged: z.number().optional(),
    projectComplexityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ENTERPRISE']).optional()
  }).optional()
});

// Experience Requirement
const ExperienceRequirementSchema = z.object({
  totalYears: z.object({
    minimum: z.number(),
    preferred: z.number().optional(),
    maximum: z.number().optional()
  }),
  industryExperience: z.object({
    required: z.boolean(),
    industries: z.array(z.string()),
    minimumYears: z.number().optional()
  }),
  roleSpecificExperience: z.object({
    similarRoles: z.array(z.string()),
    minimumYears: z.number(),
    responsibilities: z.array(z.string())
  }),
  leadershipExperience: z.object({
    required: z.boolean(),
    teamSize: z.object({
      minimum: z.number().optional(),
      maximum: z.number().optional()
    }).optional(),
    managementLevel: z.enum([
      'INDIVIDUAL_CONTRIBUTOR',
      'TEAM_LEAD',
      'MANAGER',
      'SENIOR_MANAGER',
      'DIRECTOR',
      'VP'
    ]).optional()
  })
});

// Education Requirement
const EducationRequirementSchema = z.object({
  degree: z.object({
    required: z.boolean(),
    level: z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD']).optional(),
    fields: z.array(z.string()).optional(),
    equivalentExperience: z.boolean().optional()
  }),
  certifications: z.array(z.object({
    name: z.string(),
    required: z.boolean(),
    alternatives: z.array(z.string()).optional(),
    validityPeriod: z.number().optional(),
    weight: z.number()
  })),
  continuousLearning: z.object({
    required: z.boolean(),
    examples: z.array(z.string()).optional()
  })
});

// Responsibilities
const ResponsibilitySchema = z.object({
  description: z.string(),
  priority: z.enum(['PRIMARY', 'SECONDARY', 'OCCASIONAL']),
  skillsRequired: z.array(z.string()),
  complexityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  percentageOfTime: z.number().optional()
});

// Job Info
const JobInfoSchema = z.object({
  title: z.string(),
  department: z.string().optional(),
  reportingStructure: z.string().optional(),
  jobLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'PRINCIPAL', 'EXECUTIVE']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'])
});

// Main Schema
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
        "reportingStructure": { "type": Type.STRING },
        "jobLevel": {
          "type": Type.STRING,
          "enum": ["ENTRY", "MID", "SENIOR", "PRINCIPAL", "EXECUTIVE"]
        },
        "employmentType": {
          "type": Type.STRING,
          "enum": ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]
        }
      },
      "required": ["title", "jobLevel", "employmentType"]
    },
    "skillRequirements": {
      "type": Type.ARRAY,
      "items": {
        "type": Type.OBJECT,
        "properties": {
          "name": { "type": Type.STRING },
          "category": {
            "type": Type.STRING,
            "enum": ["TECHNICAL_HARD", "TECHNICAL_SOFT", "DOMAIN_SPECIFIC", "LEADERSHIP", "COMMUNICATION", "ANALYTICAL", "CREATIVE", "OPERATIONAL"]
          },
          "requiredLevel": {
            "type": Type.STRING,
            "enum": ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"]
          },
          "minimumYearsExperience": { "type": Type.NUMBER },
          "requirementType": {
            "type": Type.STRING,
            "enum": ["MUST_HAVE", "NICE_TO_HAVE", "PREFERRED", "DEAL_BREAKER"]
          },
          "keywords": {
            "type": Type.ARRAY,
            "items": { "type": Type.STRING }
          },
          "context": { "type": Type.STRING },
          "assessmentMethods": {
            "type": Type.ARRAY,
            "items": {
              "type": Type.STRING,
              "enum": ["TECHNICAL_TEST", "BEHAVIORAL_INTERVIEW", "PORTFOLIO_REVIEW", "CODE_REVIEW", "CASE_STUDY", "PRESENTATION", "REFERENCE_CHECK", "CERTIFICATION_VERIFICATION"]
            }
          },
          "weight": { "type": Type.NUMBER },
          "validationCriteria": {
            "type": Type.OBJECT,
            "properties": {
              "portfolioRequired": { "type": Type.BOOLEAN },
              "certificationRequired": { "type": Type.BOOLEAN },
              "specificToolsVersions": {
                "type": Type.ARRAY,
                "items": { "type": Type.STRING }
              },
              "industryExperienceRequired": { "type": Type.BOOLEAN },
              "teamSizeManaged": { "type": Type.NUMBER },
              "projectComplexityLevel": {
                "type": Type.STRING,
                "enum": ["LOW", "MEDIUM", "HIGH", "ENTERPRISE"]
              }
            },
            "required": []
          }
        },
        "required": ["name", "category", "requiredLevel", "minimumYearsExperience", "requirementType", "keywords", "assessmentMethods", "weight"]
      }
    },
    "experienceRequirements": {
      "type": Type.OBJECT,
      "properties": {
        "totalYears": {
          "type": Type.OBJECT,
          "properties": {
            "minimum": { "type": Type.NUMBER },
            "preferred": { "type": Type.NUMBER },
            "maximum": { "type": Type.NUMBER }
          },
          "required": ["minimum"]
        },
        "industryExperience": {
          "type": Type.OBJECT,
          "properties": {
            "required": { "type": Type.BOOLEAN },
            "industries": {
              "type": Type.ARRAY,
              "items": { "type": Type.STRING }
            },
            "minimumYears": { "type": Type.NUMBER }
          },
          "required": ["required", "industries"]
        },
        "roleSpecificExperience": {
          "type": Type.OBJECT,
          "properties": {
            "similarRoles": {
              "type": Type.ARRAY,
              "items": { "type": Type.STRING }
            },
            "minimumYears": { "type": Type.NUMBER },
            "responsibilities": {
              "type": Type.ARRAY,
              "items": { "type": Type.STRING }
            }
          },
          "required": ["similarRoles", "minimumYears", "responsibilities"]
        },
        "leadershipExperience": {
          "type": Type.OBJECT,
          "properties": {
            "required": { "type": Type.BOOLEAN },
            "teamSize": {
              "type": Type.OBJECT,
              "properties": {
                "minimum": { "type": Type.NUMBER },
                "maximum": { "type": Type.NUMBER }
              },
              "required": []
            },
            "managementLevel": {
              "type": Type.STRING,
              "enum": ["INDIVIDUAL_CONTRIBUTOR", "TEAM_LEAD", "MANAGER", "SENIOR_MANAGER", "DIRECTOR", "VP"]
            }
          },
          "required": ["required"]
        }
      },
      "required": ["totalYears", "industryExperience", "roleSpecificExperience", "leadershipExperience"]
    },
    "educationRequirements": {
      "type": Type.OBJECT,
      "properties": {
        "degree": {
          "type": Type.OBJECT,
          "properties": {
            "required": { "type": Type.BOOLEAN },
            "level": {
              "type": Type.STRING,
              "enum": ["HIGH_SCHOOL", "ASSOCIATE", "BACHELOR", "MASTER", "PHD"]
            },
            "fields": {
              "type": Type.ARRAY,
              "items": { "type": Type.STRING }
            },
            "equivalentExperience": { "type": Type.BOOLEAN }
          },
          "required": ["required"]
        },
        "certifications": {
          "type": Type.ARRAY,
          "items": {
            "type": Type.OBJECT,
            "properties": {
              "name": { "type": Type.STRING },
              "required": { "type": Type.BOOLEAN },
              "alternatives": {
                "type": Type.ARRAY,
                "items": { "type": Type.STRING }
              },
              "validityPeriod": { "type": Type.NUMBER },
              "weight": { "type": Type.NUMBER }
            },
            "required": ["name", "required", "weight"]
          }
        },
        "continuousLearning": {
          "type": Type.OBJECT,
          "properties": {
            "required": { "type": Type.BOOLEAN },
            "examples": {
              "type": Type.ARRAY,
              "items": { "type": Type.STRING }
            }
          },
          "required": ["required"]
        }
      },
      "required": ["degree", "certifications", "continuousLearning"]
    },
    "responsibilities": {
      "type": Type.ARRAY,
      "items": {
        "type": Type.OBJECT,
        "properties": {
          "description": { "type": Type.STRING },
          "priority": {
            "type": Type.STRING,
            "enum": ["PRIMARY", "SECONDARY", "OCCASIONAL"]
          },
          "skillsRequired": {
            "type": Type.ARRAY,
            "items": { "type": Type.STRING }
          },
          "complexityLevel": {
            "type": Type.STRING,
            "enum": ["LOW", "MEDIUM", "HIGH"]
          },
          "percentageOfTime": { "type": Type.NUMBER }
        },
        "required": ["description", "priority", "skillsRequired", "complexityLevel"]
      }
    }
  },
  "required": ["jobInfo", "skillRequirements", "experienceRequirements", "educationRequirements", "responsibilities"]
}
