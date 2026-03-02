import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { usersService } from './users.service';

export async function getByEmail(req: Request, res: Response): Promise<void> {
  const email = req.params.email;
  if (email !== req.decoded?.email) {
    res.status(403).send({ message: 'Forbidden request' });
    return;
  }
  const user = await usersService.findByEmail(email);
  res.send(user);
}

export async function getAll(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const search = (req.query.search as string) || '';
  const result = await usersService.findAll({ page, limit, search });
  res.send(result);
}

export async function checkAdmin(req: Request, res: Response): Promise<void> {
  const email = req.params.email;
  if (email !== req.decoded?.email) {
    res.status(403).send({ message: 'Forbidden request' });
    return;
  }
  const user = await usersService.findByEmail(email);
  const isAdmin = user && user.role === 'admin';
  res.send(isAdmin);
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = req.body;
  const existing = await usersService.findByEmail(user.email);
  if (existing) {
    res.send({ message: 'User already exists', insertedId: existing._id });
    return;
  }
  const result = await usersService.create(user);
  res.json(result);
}

export async function updateRole(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const { role, email } = req.body;
  const result = await usersService.updateRole(new ObjectId(id), role, email);
  res.json(result);
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const result = await usersService.deleteById(new ObjectId(id));
  res.json(result);
}
