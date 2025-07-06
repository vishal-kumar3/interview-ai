"use server"
import { uploadFileToS3 } from "@/config/s3.config";
import { EntityType } from "@/types/user.types";
import fs from "fs";



export const saveFileToLocal = async (file: File, name: string): Promise<{
  error: string | null,
  data: string | null
}> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `./public/temp/${Date.now()}-${name}`;
    fs.writeFileSync(filePath, buffer);
    return {
      error: null,
      data: filePath
    };
  } catch (error) {
    console.error("Error saving file to local:", error);
    return {
      error: "Failed to save file locally.",
      data: null
    };
  }
}


export const saveBlobToLocal = async (blob: Blob | undefined, fileName: string): Promise<{
  error: string | null,
  data: string | null
}> => {
  if (!blob) {
    return {
      error: "No file provided to save.",
      data: null
    };
  }

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `./public/temp/${fileName}`;
    fs.writeFileSync(filePath, buffer);
    return {
      error: null,
      data: filePath
    };
  } catch (error) {
    console.error("Error saving blob to local:", error);
    return {
      error: "Failed to save file locally.",
      data: null
    };
  }
}

export const fileToS3 = async (
  filePath: string,
  fileName: string,
  entitytype: EntityType
): Promise<{
  error: string | null,
  data: {
    fileUrl: string,
    key: string
  } | null
}> => {
  try {
    const key = `${entitytype}/${Date.now()}-${fileName}`;
    const fileContent = fs.readFileSync(filePath);
    const { error, data } = await uploadFileToS3(fileContent, key);
    return { error, data }
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return {
      error: "Failed to upload file to S3.",
      data: null
    };
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }
  }
};
