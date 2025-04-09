import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
} from "../controllers/projectController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createProject);
router.get("/", auth, getProjects);
router.get("/:id", auth, getProject);
router.put("/:id", auth, updateProject);

export default router;
