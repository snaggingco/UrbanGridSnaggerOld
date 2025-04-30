import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

/**
 * Authentication middleware
 * Checks for a valid Bearer token in the Authorization header
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const user = await storage.validateToken(token);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
};

/**
 * Admin authorization middleware
 * Ensures the authenticated user has admin role
 * Must be used after requireAuth middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
};