import type { Request, Response } from 'express';
import { successStoriesService } from './success-stories.service';
import { biodatasService } from '../biodatas';

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const {
      selfBiodataId,
      partnerBiodataId,
      coupleImage,
      successStory,
      marriageDate,
      rating,
    } = data;

    const selfBiodata = await biodatasService.findByBiodataId(
      parseInt(String(selfBiodataId), 10)
    );
    const partnerBiodata = await biodatasService.findByBiodataId(
      parseInt(String(partnerBiodataId), 10)
    );

    if (!selfBiodata || !partnerBiodata) {
      res.status(404).json({ error: 'One or both biodatas not found' });
      return;
    }

    const story = {
      selfBiodataId,
      partnerBiodataId,
      selfDetails: {
        name: selfBiodata.name,
        photo: selfBiodata.profileImage,
        birthday: selfBiodata.dob,
      },
      partnerDetails: {
        name: partnerBiodata.name,
        photo: partnerBiodata.profileImage,
        birthday: partnerBiodata.dob,
      },
      coupleImage,
      successStory,
      marriageDate,
      rating: parseFloat(rating),
    };

    const result = await successStoriesService.create(story);
    res.send(result);
  } catch (error) {
    console.error('Error saving success story:', error);
    res.status(500).json({ error: 'Failed to save success story' });
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const stories = await successStoriesService.findAll();
    res.send(stories);
  } catch (error) {
    console.error('Error fetching success stories:', error);
    res.status(500).json({ error: 'Failed to fetch success stories' });
  }
}
