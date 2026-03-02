import type { ObjectId } from 'mongodb';
import { getCollections } from '../../config/database';
import type { PremiumRequest } from '../../types';

export const premiumRequestsService = {
  async create(biodataId: string, biodata: { biodataId: number; userEmail: string; name?: string }) {
    const { premiumRequests } = getCollections();
    const existing = await premiumRequests.findOne({
      biodataUniqueId: biodataId,
      userEmail: biodata.userEmail,
    });
    if (existing) return { result: null, exists: true };

    const requestPremium: Omit<PremiumRequest, '_id'> = {
      biodataUniqueId: biodataId,
      biodataId: biodata.biodataId,
      userEmail: biodata.userEmail,
      userName: biodata.name,
      status: 'pending',
    };
    const result = await premiumRequests.insertOne(requestPremium);
    return { result, exists: false };
  },

  async findAll(): Promise<PremiumRequest[]> {
    const { premiumRequests } = getCollections();
    return (await premiumRequests.find().toArray()) as PremiumRequest[];
  },

  async findByEmail(email: string): Promise<PremiumRequest[]> {
    const { premiumRequests } = getCollections();
    return (await premiumRequests.find({ userEmail: email }).toArray()) as PremiumRequest[];
  },

  async approve(id: ObjectId, userEmail: string) {
    const { premiumRequests, users, biodatas } = getCollections();
    await premiumRequests.updateOne({ _id: id }, { $set: { status: 'approved' } });
    await users.updateOne({ email: userEmail }, { $set: { role: 'premium' } });
    await biodatas.updateOne({ userEmail }, { $set: { isPremium: true } });
  },

  async deleteById(id: ObjectId) {
    const { premiumRequests } = getCollections();
    return premiumRequests.deleteOne({ _id: id });
  },
};
