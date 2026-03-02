import type { ObjectId } from 'mongodb';
import { getCollections } from '../../config/database';
import type { Favourite } from '../../types';

export const favouritesService = {
  async findByEmail(email: string): Promise<Favourite[]> {
    const { favourites } = getCollections();
    return (await favourites.find({ email }).toArray()) as Favourite[];
  },

  async create(favourite: Favourite) {
    const { favourites } = getCollections();
    const existing = await favourites.findOne({
      email: favourite.email,
      favouriteBiodataId: favourite.favouriteBiodataId,
    });
    if (existing) return { result: null, exists: true };
    const result = await favourites.insertOne(favourite);
    return { result, exists: false };
  },

  async deleteById(id: ObjectId) {
    const { favourites } = getCollections();
    return favourites.deleteOne({ _id: id });
  },
};
