import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const uploadFileToS3 = async (
  fileContent: Buffer | string,
  key: string
) => {
  const bucketName = process.env.S3_BUCKET!;
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: 'application/pdf',
  };

  const command = new PutObjectCommand(uploadParams);
  const uploaded = await s3Client.send(command);

  if (!uploaded.$metadata.httpStatusCode || uploaded.$metadata.httpStatusCode !== 200) {
    return {
      error: "Failed to upload file to S3.",
      data: null
    }
  }

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { error: null, data: { fileUrl, key } };
}

export const previewFile = async ({ key, expiresIn = 3600 }: { key: string, expiresIn: number }) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });


  const result = await getSignedUrl(s3Client, command, { expiresIn });
  return result;
}


export const deleteFileFromS3 = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
}
