import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../models/User";

interface TokenPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!process.env.JWT_SECRET) throw new Error("Missing JWT secret");
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid authentication" });
  }
};
