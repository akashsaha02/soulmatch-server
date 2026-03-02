import { getCollections } from '../../config/database';
import type { SuccessStory } from '../../types';

export const successStoriesService = {
  async create(story: Omit<SuccessStory, '_id' | 'date'>) {
    const { successStories } = getCollections();
    const doc = { ...story, date: new Date() };
    return successStories.insertOne(doc);
  },

  async findAll(): Promise<SuccessStory[]> {
    const { successStories } = getCollections();
    return (await successStories.find().toArray()) as SuccessStory[];
  },
};
