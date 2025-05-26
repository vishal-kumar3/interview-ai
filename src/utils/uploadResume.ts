import { s3Client } from "@/config/s3.config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";


export const saveFileToLocal = async (file: File) => {

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `./public/temp/${file.name}`;
  const fs = require('fs');
  fs.writeFileSync(filePath, buffer);

  return filePath;
}


export const uploadFileToS3 = async (filePath: string, fileName: string): Promise<string> => {
  try {
    const bucketName = process.env.S3_BUCKET;

    if (!bucketName) {
      throw new Error("S3_BUCKET is not defined in the environment variables.");
    }

    const fileContent = fs.readFileSync(filePath);

    const uploadParams = {
      Bucket: bucketName,
      Key: `resume/ {fileName}`,
      Body: fileContent,
      ContentType: 'application/pdf',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3.");
  } finally {
    fs.unlinkSync(filePath);
  }
};
