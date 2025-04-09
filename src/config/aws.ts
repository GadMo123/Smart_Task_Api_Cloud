import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create S3 instance
export const s3 = new AWS.S3();

// Create SES instance for email
export const ses = new AWS.SES();

export const S3_BUCKET = process.env.S3_BUCKET || "task-manager-files";
