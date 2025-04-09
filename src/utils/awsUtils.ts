import AWS from "aws-sdk";
import { s3, S3_BUCKET } from "../config/aws";

/**
 * Format a date for display in emails and UI
 */
export const formatDate = (date: Date | undefined): string => {
  if (!date) return "N/A";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Check if an S3 object exists
 */
export const checkS3ObjectExists = async (key: string): Promise<boolean> => {
  try {
    await s3
      .headObject({
        Bucket: S3_BUCKET,
        Key: key,
      })
      .promise();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Delete an S3 object
 */
export const deleteS3Object = async (key: string): Promise<boolean> => {
  try {
    await s3
      .deleteObject({
        Bucket: S3_BUCKET,
        Key: key,
      })
      .promise();
    return true;
  } catch (error) {
    console.error("Error deleting S3 object:", error);
    return false;
  }
};

/**
 * Extract S3 key from a complete URL
 */
export const getS3KeyFromUrl = (url: string): string => {
  // Example URL: https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg
  // We want to extract: path/to/file.jpg
  const urlParts = url.split("/");
  return urlParts.slice(3).join("/");
};

/**
 * Generate a pre-signed URL for file download
 */
export const generateSignedDownloadUrl = (
  key: string,
  expirationInSeconds = 900
): string => {
  const signedUrl = s3.getSignedUrl("getObject", {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: expirationInSeconds, // Default: 15 minutes
  });

  return signedUrl;
};

/**
 * Generate a pre-signed URL for file upload
 */
export const generateSignedUploadUrl = (
  key: string,
  contentType: string,
  expirationInSeconds = 300
): string => {
  const signedUrl = s3.getSignedUrl("putObject", {
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    Expires: expirationInSeconds, // Default: 5 minutes
  });

  return signedUrl;
};

/**
 * Get file size in human-readable format
 */
export const getHumanReadableSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
};
