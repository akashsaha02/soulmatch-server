import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getCollections } from '../config/database';

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.headers.authorization) {
    res.status(401).send({ message: 'Unauthorized request' });
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).send({ message: 'Forbidden request' });
      return;
    }
    req.decoded = decoded as { email: string };
    next();
  });
}

export async function verifyAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const email = req.decoded?.email;
  if (!email) {
    res.status(403).send({ message: 'Forbidden request' });
    return;
  }

  const { users } = getCollections();
  const user = await users.findOne({ email });
  const isAdmin = user && (user as { role?: string }).role === 'admin';
  if (!isAdmin) {
    res.status(403).send({ message: 'Forbidden request' });
    return;
  }
  next();
}
