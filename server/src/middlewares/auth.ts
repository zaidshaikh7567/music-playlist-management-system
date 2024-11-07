import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
    };

    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    res.status(403).json({ error: "Invalid token" });
  }
};
