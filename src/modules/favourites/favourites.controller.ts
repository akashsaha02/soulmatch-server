import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { favouritesService } from './favourites.service';

export async function getByEmail(req: Request, res: Response): Promise<void> {
  const email = req.query.email as string;
  const result = await favouritesService.findByEmail(email);
  res.send(result);
}

export async function create(req: Request, res: Response): Promise<void> {
  const favourite = req.body;
  const { email, favouriteEmail, favouriteBiodataId } = favourite;

  if (email === favouriteEmail) {
    res.status(400).json({ message: 'You cannot add your own profile to favourites.' });
    return;
  }

  const { result, exists } = await favouritesService.create(favourite);
  if (exists) {
    res.status(400).json({ message: 'Already added to favourites!' });
    return;
  }
  res.json(result);
}

export async function deleteById(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const result = await favouritesService.deleteById(new ObjectId(id));
  res.json(result);
}
