import express from "express";
import {
  upload,
  uploadTaskAttachment,
  getSignedUrl,
} from "../controllers/fileController";
import { auth } from "../middleware/auth";

const router = express.Router();

// Upload attachment to a task
router.post(
  "/tasks/:taskId/attachment",
  auth,
  upload.single("file"),
  uploadTaskAttachment
);

// Get a signed URL to access a file
router.get("/tasks/:taskId/attachment", auth, getSignedUrl);

export default router;
