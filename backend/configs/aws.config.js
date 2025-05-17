// #configs/aws.configs.js
import {S3Client} from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    maxAttempts: 15,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const S3_MEDIA_BUCKET_NAME = process.env.AWS_S3_MEDIA_BUCKET_NAME;
const CLOUDFRONT_MEDIA_DOMAIN_NAME = process.env.AWS_CLOUDFRONT_MEDIA_DOMAIN_NAME;

export {s3Client, S3_MEDIA_BUCKET_NAME, CLOUDFRONT_MEDIA_DOMAIN_NAME};