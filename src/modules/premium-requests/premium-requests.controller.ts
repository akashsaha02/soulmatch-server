import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { premiumRequestsService } from './premium-requests.service';
import { biodatasService } from '../biodatas';

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const biodata = await biodatasService.findById(new ObjectId(id));
    if (!biodata) {
      res.status(404).send({ message: 'Biodata not found' });
      return;
    }

    const { result, exists } = await premiumRequestsService.create(id, {
      biodataId: biodata.biodataId ?? 0,
      userEmail: biodata.userEmail,
      name: biodata.name,
    });

    if (exists) {
      res
        .status(400)
        .send({ message: 'Premium request already exists for this user and biodata' });
      return;
    }
    res.send(result);
  } catch (error) {
    console.error('Error creating premium request:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  const requests = await premiumRequestsService.findAll();
  res.send(requests);
}

export async function getByEmail(req: Request, res: Response): Promise<void> {
  const email = req.params.email;
  const requests = await premiumRequestsService.findByEmail(email);
  res.send(requests);
}

export async function approve(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;
    await premiumRequestsService.approve(new ObjectId(id), userEmail);
    res.send({ message: 'Request approved and user role updated' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).send({ message: 'Failed to approve request' });
  }
}

export async function deleteRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await premiumRequestsService.deleteById(new ObjectId(id));
    res.send(result);
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).send({ message: 'Failed to delete request' });
  }
}
