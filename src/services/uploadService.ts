import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const UPLOAD_STORAGE = process.env.UPLOAD_STORAGE || 'local';
const UPLOAD_LOCAL_PATH = process.env.UPLOAD_LOCAL_PATH || './uploads';
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || '/uploads';

const s3Client = UPLOAD_STORAGE === 's3' ? new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}) : null;

export const uploadFile = async (file: Express.Multer.File, userId: string): Promise<string> => {
  const extension = path.extname(file.originalname);
  const fileName = `${userId}_${Date.now()}${extension}`;

  if (UPLOAD_STORAGE === 's3' && s3Client) {
    const bucket = process.env.AWS_S3_BUCKET;
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    return `https://${bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
  } else {
    // Local storage
    const userDir = path.join(UPLOAD_LOCAL_PATH, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const filePath = path.join(userDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    
    // Return URL: http://localhost:4000/uploads/userId/fileName
    return `${UPLOAD_BASE_URL}/${userId}/${fileName}`;
  }
};
