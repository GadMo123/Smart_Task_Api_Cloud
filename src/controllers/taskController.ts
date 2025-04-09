import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Task, TaskStatus } from "../models/Task";
import { Project } from "../models/Project";
import { User } from "../models/User";

export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { title, description, projectId, dueDate, assigneeId } = req.body;
    
    // Verify the project exists and belongs to the current user
    const projectRepository = getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: projectId, owner: req.user }
    });
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const taskRepository = getRepository(Task);
    const task = taskRepository.create({
      title,
      description,
      project,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    
    // If an assignee is specified, verify they exist
    if (assigneeId) {
      const userRepository = getRepository(User);
      const assignee = await userRepository.findOne(assigneeId);
      
      if (assignee) {
        task.assignee = assignee;
      }
    }
    
    await taskRepository.save(task);
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const projectId = parseInt(req.params.projectId);
    
    // Verify the project exists and belongs to the current user
    const projectRepository = getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: projectId, owner: req.user }
    });
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const taskRepository = getRepository(Task);
    const tasks = await taskRepository.find({
      where: { project },
      order: { createdAt: "DESC" },
      relations: ["assignee"]
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const taskRepository = getRepository(Task);
    const task = await taskRepository.findOne({
      where: { id: taskId },
      relations: ["project", "project.owner"]
    });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Verify the task belongs to a project owned by the current user
    if (task.project.owner.id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    task.status = status as TaskStatus;
    
    await taskRepository.save(task);
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const taskId = parseInt(req.params.id);
    const { title, description, dueDate, assigneeId, status } = req.body;
    
    const taskRepository = getRepository(Task);
    const task = await taskRepository.findOne({
      where: { id: taskId },
      relations: ["project", "project.owner"]
    });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Verify the task belongs to a project owned by the current user
    if (task.project.owner.id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Update task properties
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      task.status = status as TaskStatus;
    }
    
    // If assignee is updated
    if (assigneeId !== undefined) {
      if (assigneeId === null) {
        task.assignee = null;
      } else {
        const userRepository = getRepository(User);
        const assignee = await userRepository.findOne(assigneeId);
        
        if (!assignee) {
          return res.status(404).json({ message: "Assignee not found" });
        }
        
        task.assignee = assignee;
      }
    }
    
    await taskRepository.save(task);
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const taskId = parseInt(req.params.id);
    
    const taskRepository = getRepository(Task);
    const task = await taskRepository.findOne({
      where: { id: taskId },
      relations: ["project", "project.owner"]
    });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Verify the task belongs to a project owned by the current user
    if (task.project.owner.id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    await taskRepository.remove(task);
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};