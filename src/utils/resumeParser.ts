import { createGenAIText } from "@/config/gemini.config";
import { resumeParserPrompt } from "@/lib/prompt";
import { resumeParseJsonSchema, resumeReponseSchema } from "@/schema/resume.schema";
import { execSync } from "child_process";



export async function parseResumeWithAi(text: string): Promise<any> {
  const prompt = `${resumeParserPrompt}.
  Resume Text: ${text}`

  try {
    const response = await createGenAIText(
      `Resume Text as base64: ${text}`,
      resumeParserPrompt,
      resumeReponseSchema
    )

    if (!response?.parts) throw new Error("No response parts found from AI");

    const parsedResponse = JSON.parse(response.parts[0].text as string)
    // const validation = resumeParseJsonSchema.safeParse(parsedResponse);
    console.log(parsedResponse)
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    throw new Error("Failed to parse resume with AI.");
  }
}


export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const escapedFilePath = filePath.replace(/'/g, "\\'");
    // wip: isse achha ek python server use krle
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
