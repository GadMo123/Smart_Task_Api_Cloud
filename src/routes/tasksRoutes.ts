import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController";
import { auth } from "../middleware/auth";

const router = express.Router();

// Create a new task
router.post("/", auth, createTask);

// Get all tasks for a project
router.get("/project/:projectId", auth, getTasks);

// Update task status
router.patch("/:id/status", auth, updateTaskStatus);

// Update task details
router.put("/:id", auth, updateTask);

// Delete a task
router.delete("/:id", auth, deleteTask);

export default router;
