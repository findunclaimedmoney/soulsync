import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (!session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return next();
}
