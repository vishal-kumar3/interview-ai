"use server"
import { uploadFileToS3 } from "@/config/s3.config";
import { EntityType } from "@/types/user.types";
import fs from "fs";



export const saveFileToLocal = async (file: File) => {

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `./public/temp/${file.name}`;
  fs.writeFileSync(filePath, buffer);

  return filePath;
}


export const saveBlobToLocal = async (blob: Blob | undefined, fileName: string): Promise<string> => {
  if (!blob) {
    throw new Error("No file provided to save.");
  }
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `./public/temp/${fileName}`;
  fs.writeFileSync(filePath, buffer);
  return filePath;
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
    throw new Error("Failed to upload file to S3.");
  } finally {
    fs.unlinkSync(filePath);
  }
};
