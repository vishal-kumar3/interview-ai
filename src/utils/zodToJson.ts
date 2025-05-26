
import { resumeParseJsonSchema } from "@/schema/resume.schema";
import { zodToJsonSchema } from "zod-to-json-schema";

export function parseResume() {
  const jsonSchema = zodToJsonSchema(resumeParseJsonSchema, {
    target: 'openApi3',
  });
  console.log("JSON Schema generated from Zod schema:", jsonSchema);
  const schemaForModel = {
    type: "object",
    properties: jsonSchema.definitions
  };

  console.log("Generated JSON Schema:", JSON.stringify(schemaForModel, null, 2));
}
