import { createAiCompletion } from "@/config/ai.config";
import { resumeParserPrompt } from "@/lib/prompt";
import { resumeParseJsonSchema } from "@/schema/resume.schema";
import { execSync } from "child_process";



export async function parseResumeWithAi(text: string): Promise<any> {
  const prompt = `${resumeParserPrompt}.
  Resume Text: ${text}`

  try {
    const response = await createAiCompletion(
      [
        {
          role: "system",
          content: "You are a resume parsing assistant that extracts structured information from resumes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      resumeParseJsonSchema,
      "resumeParseResponse"
    )

    return response;
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    throw new Error("Failed to parse resume with AI.");
  }
}


export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const escapedFilePath = filePath.replace(/'/g, "\\'");

    const text = execSync(
      `python -c "
import pdfplumber
with pdfplumber.open('${escapedFilePath}') as pdf:
    text = ''
    for page in pdf.pages:
        text += page.extract_text() or ''
    print(text)
"`
    ).toString();

    return text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
}
