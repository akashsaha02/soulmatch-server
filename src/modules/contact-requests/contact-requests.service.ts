import type { ObjectId } from 'mongodb';
import { getCollections } from '../../config/database';
import type { ContactRequest } from '../../types';

export const contactRequestsService = {
  async create(payment: ContactRequest) {
    const { contactRequests } = getCollections();
    return contactRequests.insertOne(payment);
  },

  async findByEmail(email: string): Promise<ContactRequest[]> {
    const { contactRequests } = getCollections();
    return (await contactRequests.find({ email }).toArray()) as ContactRequest[];
  },

  async deleteById(id: ObjectId) {
    const { contactRequests } = getCollections();
    return contactRequests.deleteOne({ _id: id });
  },

  async findAll(): Promise<ContactRequest[]> {
    const { contactRequests } = getCollections();
    return (await contactRequests.find().toArray()) as ContactRequest[];
  },

  async approve(id: ObjectId, biodataId: number) {
    const { contactRequests, biodatas } = getCollections();
    const biodata = await biodatas.findOne({ biodataId }) as { mobileNumber?: string } | null;
    if (!biodata?.mobileNumber) {
      return null;
    }
    const result = await contactRequests.updateOne(
      { _id: id },
      { $set: { status: 'approved', mobileNumber: biodata.mobileNumber } }
    );
    return result;
  },
};
