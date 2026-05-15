import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET ?? "lumora-photos";
const publicUrl = process.env.R2_PUBLIC_URL;

const client = accountId && accessKeyId && secretAccessKey
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  : null;

export function r2Enabled(): boolean {
  return client !== null;
}

export async function presignUpload(key: string, contentType: string, expiresInSec = 600): Promise<string> {
  if (!client) throw new Error("R2 not configured");
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return await getSignedUrl(client, cmd, { expiresIn: expiresInSec });
}

export async function presignGet(key: string, expiresInSec = 3600): Promise<string> {
  if (!client) throw new Error("R2 not configured");
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return await getSignedUrl(client, cmd, { expiresIn: expiresInSec });
}

export function publicObjectUrl(key: string): string {
  if (publicUrl) return `${publicUrl.replace(/\/$/, "")}/${key}`;
  return `https://${bucket}.r2.dev/${key}`;
}
