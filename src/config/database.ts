import { createConnection } from "typeorm";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import dotenv from "dotenv";

dotenv.config();

export const initializeDatabase = async () => {
  try {
    await createConnection({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "taskmanager",
      entities: [User, Project, Task],
      synchronize: true, // Only in development
      logging: false,
    });
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
