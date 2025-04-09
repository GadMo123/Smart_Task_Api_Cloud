// src/controllers/fileController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Task } from "../models/Task";
import { s3, S3_BUCKET } from "../config/aws";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Configure multer for memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadTaskAttachment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const taskId = parseInt(req.params.taskId);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const taskRepository = getRepository(Task);
    const task = await taskRepository.findOne({
      where: { id: taskId },
      relations: ["project", "project.owner"],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify the task belongs to a project owned by the current user
    if (task.project.owner.id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Generate a unique key for the file
    const fileKey = `tasks/${taskId}/${uuidv4()}-${file.originalname}`;

    // Upload file to S3
    const uploadParams = {
      Bucket: S3_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "private",
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Update task with attachment URL
    task.attachmentUrl = uploadResult.Location;
    await taskRepository.save(task);

    res.json({
      message: "File uploaded successfully",
      fileUrl: uploadResult.Location,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSignedUrl = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const taskId = parseInt(req.params.taskId);

    const taskRepository = getRepository(Task);
    const task = await taskRepository.findOne({
      where: { id: taskId },
      relations: ["project", "project.owner"],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify the task belongs to a project owned by the current user
    if (task.project.owner.id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!task.attachmentUrl) {
      return res.status(404).json({ message: "No attachment found" });
    }

    // Extract the key from the URL
    const urlParts = task.attachmentUrl.split("/");
    const key = urlParts.slice(3).join("/");

    // Generate a signed URL that expires in 15 minutes
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: 900, // 15 minutes
    });

    res.json({
      signedUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
