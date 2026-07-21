import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import { env } from '../config/env.js';

const enabled = Boolean(process.env.S3_BUCKET && process.env.S3_REGION);
const client = enabled ? new S3Client({ region: process.env.S3_REGION, endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' }) : undefined;
export async function storeImage(file: Express.Multer.File) {
  if (!client || !process.env.S3_BUCKET) return `${env.PUBLIC_API_URL}/uploads/${file.filename}`;
  const key = `diagnoses/${randomUUID()}-${file.filename}`;
  await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: await readFile(file.path), ContentType: file.mimetype }));
  await unlink(file.path);
  return `${process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`}/${key}`;
}
