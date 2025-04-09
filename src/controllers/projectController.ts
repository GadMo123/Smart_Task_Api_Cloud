import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Project } from "../models/Project";

export const createProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { title, description } = req.body;

    const projectRepository = getRepository(Project);
    const project = projectRepository.create({
      title,
      description,
      owner: req.user,
    });

    await projectRepository.save(project);

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const projectRepository = getRepository(Project);
    const projects = await projectRepository.find({
      where: { owner: req.user },
      order: { createdAt: "DESC" },
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const projectId = parseInt(req.params.id);
    const projectRepository = getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: projectId, owner: req.user },
      relations: ["tasks"],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const projectId = parseInt(req.params.id);
    const { title, description } = req.body;

    const projectRepository = getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: projectId, owner: req.user },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.title = title || project.title;
    project.description = description || project.description;

    await projectRepository.save(project);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const projectId = parseInt(req.params.id);

    const projectRepository = getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: projectId, owner: req.user },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await projectRepository.remove(project);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
