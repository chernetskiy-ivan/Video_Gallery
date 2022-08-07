import express from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token: string | undefined = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, String(process.env.JWT_SECRET));

    next();
  } catch (e) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
};
