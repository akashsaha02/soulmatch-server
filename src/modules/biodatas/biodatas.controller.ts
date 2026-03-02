import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { biodatasService } from './biodatas.service';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const biodatas = await biodatasService.findAll();
    res.send(biodatas);
  } catch {
    res.status(500).send({ error: 'Failed to fetch biodatas' });
  }
}

export async function getByEmail(req: Request, res: Response): Promise<void> {
  try {
    const email = req.params.email;
    const biodata = await biodatasService.findByUserEmail(email);
    res.send(biodata);
  } catch {
    res.status(500).send({ error: 'Failed to fetch biodata' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const biodata = await biodatasService.findById(new ObjectId(id));
    res.send(biodata);
  } catch {
    res.status(500).send({ error: 'Failed to fetch biodata' });
  }
}

export async function createOrUpdate(req: Request, res: Response): Promise<void> {
  try {
    const biodata = req.body;
    const { result, updated } = await biodatasService.createOrUpdate(biodata);
    if (updated) {
      res.status(200).json({ message: 'Biodata updated successfully', result });
    } else {
      res.status(201).json({ message: 'Biodata created successfully', result });
    }
  } catch (error) {
    console.error('Error creating/updating biodata:', error);
    res.status(500).send({ error: 'Failed to create or update biodata' });
  }
}
