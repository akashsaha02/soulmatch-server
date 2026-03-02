import type { Request, Response } from 'express';
import { adminService } from './admin.service';

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await adminService.getStats();
    res.send(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
