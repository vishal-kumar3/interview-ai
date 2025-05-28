import { z } from "zod";
import { SchemaUnion, Type } from '@google/genai'

// Enums for consistent categorization
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
  'BEGINNER',      // 0-1 years
  'INTERMEDIATE',  // 1-3 years
  'ADVANCED',      // 3-5 years
  'EXPERT',        // 5+ years
  'MASTER'         // 8+ years with proven track record
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

// Core skill requirement schema
const SkillRequirementSchema = z.object({
  name: z.string().min(1),
  category: SkillCategoryEnum,
  requiredLevel: ProficiencyLevelEnum,
  minimumYearsExperience: z.number().min(0),
  requirementType: RequirementTypeEnum,
  keywords: z.array(z.string()).min(1), // Alternative names/terms
  context: z.string().optional(), // How it's used in the role
  assessmentMethods: z.array(AssessmentMethodEnum).min(1),
  weight: z.number().min(1).max(10), // Importance scoring

  // Validation criteria
  validationCriteria: z.object({
    portfolioRequired: z.boolean().default(false),
    certificationRequired: z.boolean().default(false),
    specificToolsVersions: z.array(z.string()).optional(),
    industryExperienceRequired: z.boolean().default(false),
    teamSizeManaged: z.number().optional(), // For leadership roles
    projectComplexityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ENTERPRISE']).optional()
  })
});

// Experience requirement schema
const ExperienceRequirementSchema = z.object({
  totalYears: z.object({
    minimum: z.number().min(0),
    preferred: z.number().min(0).optional(),
    maximum: z.number().optional()
  }),

  industryExperience: z.object({
    required: z.boolean(),
    industries: z.array(z.string()),
    minimumYears: z.number().min(0).optional()
  }),

  roleSpecificExperience: z.object({
    similarRoles: z.array(z.string()),
    minimumYears: z.number().min(0),
    responsibilities: z.array(z.string())
  }),

  leadershipExperience: z.object({
    required: z.boolean(),
    teamSize: z.object({
      minimum: z.number().optional(),
      maximum: z.number().optional()
    }).optional(),
    managementLevel: z.enum(['INDIVIDUAL_CONTRIBUTOR', 'TEAM_LEAD', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'VP']).optional()
  })
});

// Education requirement schema
const EducationRequirementSchema = z.object({
  degree: z.object({
    required: z.boolean(),
    level: z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD']).optional(),
    fields: z.array(z.string()).optional(),
    equivalentExperience: z.boolean().default(false) // Can experience substitute?
  }),

  certifications: z.array(z.object({
    name: z.string(),
    required: z.boolean(),
    alternatives: z.array(z.string()).optional(),
    validityPeriod: z.number().optional(), // Years before renewal
    weight: z.number().min(1).max(10)
  })),

  continuousLearning: z.object({
    required: z.boolean(),
    examples: z.array(z.string()).optional()
  })
});


export const JobDescriptionParseJsonSchema = z.object({
  // Basic job information
  jobInfo: z.object({
    title: z.string().min(1),
    department: z.string().optional(),
    reportingStructure: z.string().optional(),
    jobLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'PRINCIPAL', 'EXECUTIVE']),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'])
  }),

  // Core requirements
  skillRequirements: z.array(SkillRequirementSchema).min(1),
  experienceRequirements: ExperienceRequirementSchema,
  educationRequirements: EducationRequirementSchema,

  // Role specifics
  responsibilities: z.array(z.object({
    description: z.string(),
    priority: z.enum(['PRIMARY', 'SECONDARY', 'OCCASIONAL']),
    skillsRequired: z.array(z.string()),
    complexityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    percentageOfTime: z.number().min(0).max(100).optional()
  })).min(1),
});

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

export type JobDescriptionParseJson = z.infer<typeof JobDescriptionParseJsonSchema>;
