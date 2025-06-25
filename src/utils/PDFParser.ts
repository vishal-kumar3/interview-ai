import { createGenAIText } from "@/config/gemini.config";
import { resumeParserPrompt } from "@/lib/prompt";
import { resumeParseJsonSchema, resumeReponseSchema } from "@/schema/resume.schema";
import fs from "fs";

// Type definitions for pdf2json
interface PDFParser {
  on(event: "pdfParser_dataError", callback: (errData: any) => void): void;
  on(event: "pdfParser_dataReady", callback: (pdfData: any) => void): void;
  loadPDF(filePath: string): void;
}

interface PDFParserConstructor {
  new (): PDFParser;
}

const PDFParser = require("pdf2json") as PDFParserConstructor;


export async function extractTextFromPDF(filePath: string): Promise<{
  error: string | null,
  data: string | null
}> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new (PDFParser as any)();
      const extractedText: string[] = [];
      const hyperlinks: string[] = [];

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF parsing error:", errData);
        resolve({
          error: 'Failed to parse PDF file',
          data: null
        });
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts) {
                page.Texts.forEach((text: any) => {
                  if (text.R) {
                    text.R.forEach((run: any) => {
                      if (run.T) {
                        extractedText.push(decodeURIComponent(run.T) + ' ');
                      }
                    });
                  }
                });
              }

              if (page.Links) {
                page.Links.forEach((link: any) => {
                  if (link.uri) {
                    hyperlinks.push(decodeURIComponent(link.uri));
                  }
                });
              }
            });
          }

          let finalText = extractedText.join('').trim();
          if (hyperlinks.length > 0) {
            finalText += '\n\nHyperlinks found:\n' + hyperlinks.join('\n');
          }

          if (!finalText) {
            resolve({
              error: 'No text could be extracted from PDF',
              data: null
            });
            return;
          }

          resolve({
            error: null,
            data: finalText
          });
        } catch (error) {
          console.error("Error processing PDF data:", error);
          resolve({
            error: 'Failed to process PDF data',
            data: null
          });
        }
      });

      pdfParser.loadPDF(filePath);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      resolve({
        error: 'Failed to extract text from PDF',
        data: null
      });
    }
  });
}

export async function parseResumeWithAi(text: string): Promise<{
  error: string | null,
  data: any
}> {
  try {
    const response = await createGenAIText(
      `Resume Text: ${text}`,
      resumeParserPrompt,
      resumeReponseSchema
    )

    if (!response?.parts) {
      return {
        error: "No response parts found from AI",
        data: null
      };
    }

    const { data: parsedResponse, error } = resumeParseJsonSchema.safeParse(JSON.parse(response.parts[0].text as string));

    if (error) {
      return {
        error: "Failed to parse AI response",
        data: null
      };
    }

    return {
      error: null,
      data: parsedResponse
    };
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    return {
      error: "Failed to parse resume with AI.",
      data: null
    };
  }
}
