import { execSync } from "child_process";



async function parseResumeWithGrok(text: string): Promise<any> {
  const prompt = `Given the following resume text, extract structured data in JSON format with fields: name, email, phone, skills, education, workExperience.
  Resume Text: ${text}`

  // grok api call

  return {}
}


const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const text = execSync(
      `python -c "
      import pdfplumber
      with pdfplumber.open('${filePath}') as pdf:
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
