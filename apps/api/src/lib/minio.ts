import { Client } from "minio";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT|| "localhost",
  port: Number(process.env.MINIO_PORT)|| 9000,
  useSSL: false,
  accessKey:process.env.MINIO_ACCESS_KEY|| "minioadmin",
  secretKey:process.env.MINIO_SECRET_KEY|| "minioadmin",
});

export const setPublicBuckets = async () => {
  const bkts = ['assets', 'thumbnails'];
  for (const b of bkts) {
    const exists = await minioClient.bucketExists(b);
    if (!exists) await minioClient.makeBucket(b);
    await minioClient.setBucketPolicy(b, JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${b}/*`],
      }],
    }));
    console.log("public read bkt: ", b);
  }
};