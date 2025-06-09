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


export async function parseResumeWithAi(text: string): Promise<any> {
  try {
    const response = await createGenAIText(
      `Resume Text: ${text}`,
      resumeParserPrompt,
      resumeReponseSchema
    )

    if (!response?.parts) throw new Error("No response parts found from AI");

    const { data: parsedResponse , error} = resumeParseJsonSchema.safeParse(JSON.parse(response.parts[0].text as string));

    return parsedResponse;
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    throw new Error("Failed to parse resume with AI.");
  }
}


export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("Error parsing PDF:", errData);
        reject(new Error('Failed to extract text from PDF'));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          let extractedText = '';
          let hyperlinks: string[] = [];

          // Debug: Log the structure to understand the data format
          console.log("PDF Data structure:", JSON.stringify(pdfData, null, 2).substring(0, 500));

          // Check different possible data structures
          const pages = pdfData?.Pages || pdfData?.formImage?.Pages || pdfData?.data?.Pages;

          if (!pages || !Array.isArray(pages)) {
            console.warn("No pages found in PDF data, attempting text extraction from raw data");
            // Fallback: try to extract any text from the entire data structure
            const dataStr = JSON.stringify(pdfData);
            const textMatches = dataStr.match(/"T":"([^"]+)"/g);
            if (textMatches) {
              textMatches.forEach(match => {
                const text = match.match(/"T":"([^"]+)"/)?.[1];
                if (text) {
                  extractedText += decodeURIComponent(text) + ' ';
                }
              });
            }
          } else {
            // Extract text and hyperlinks from each page
            pages.forEach((page: any) => {
              // Extract text
              if (page.Texts) {
                page.Texts.forEach((text: any) => {
                  if (text.R) {
                    text.R.forEach((run: any) => {
                      if (run.T) {
                        extractedText += decodeURIComponent(run.T) + ' ';
                      }
                    });
                  }
                });
              }

              // Extract hyperlinks
              if (page.Links) {
                page.Links.forEach((link: any) => {
                  if (link.uri) {
                    hyperlinks.push(decodeURIComponent(link.uri));
                  }
                });
              }
            });
          }

          // Combine text with hyperlinks
          let finalText = extractedText.trim();
          if (hyperlinks.length > 0) {
            finalText += '\n\nHyperlinks found:\n' + hyperlinks.join('\n');
          }

          if (!finalText) {
            reject(new Error('No text could be extracted from PDF'));
            return;
          }

          resolve(finalText);
        } catch (error) {
          console.error("Error processing PDF data:", error);
          reject(new Error('Failed to process PDF data'));
        }
      });

      pdfParser.loadPDF(filePath);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      reject(new Error('Failed to extract text from PDF'));
    }
  });
}
