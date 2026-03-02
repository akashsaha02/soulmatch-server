import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { contactRequestsService } from './contact-requests.service';

export async function createPayment(req: Request, res: Response): Promise<void> {
  const payment = req.body;
  const result = await contactRequestsService.create(payment);
  res.json(result);
}

export async function getByEmail(req: Request, res: Response): Promise<void> {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ message: 'Email is required.' });
    return;
  }
  try {
    const requests = await contactRequestsService.findByEmail(email);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    res.status(500).json({ message: 'Failed to fetch contact requests.' });
  }
}

export async function deleteById(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const result = await contactRequestsService.deleteById(new ObjectId(id));
  res.json(result);
}

export async function approve(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const { biodataId } = req.body;
  const parsedBiodataId = parseInt(biodataId, 10);

  const biodataCheck = await contactRequestsService.approve(new ObjectId(id), parsedBiodataId);
  if (!biodataCheck) {
    res.status(404).json({ message: 'Biodata or mobile number not found.' });
    return;
  }
  if (biodataCheck.matchedCount === 0) {
    res.status(404).json({ message: 'Contact request not found.' });
    return;
  }
  res.json({ message: 'Contact request approved successfully.' });
}

export async function getAll(req: Request, res: Response): Promise<void> {
  const requests = await contactRequestsService.findAll();
  res.send(requests);
}
