import express from "express";
import { register, login, getProfile } from "../controllers/authController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, getProfile);

export default router;

// src/routes/projects.ts
import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createProject);
router.get("/", auth, getProjects);
router.get("/:id", auth, getProject);
router.put("/:id", auth, updateProject);
