import type { ObjectId } from 'mongodb';
import { getCollections } from '../../config/database';
import type { Biodata } from '../../types';

export const biodatasService = {
  async findAll(): Promise<Biodata[]> {
    const { biodatas } = getCollections();
    return (await biodatas.find().toArray()) as Biodata[];
  },

  async findByUserEmail(email: string): Promise<Biodata | null> {
    const { biodatas } = getCollections();
    return (await biodatas.findOne({ userEmail: email })) as Biodata | null;
  },

  async findById(id: ObjectId): Promise<Biodata | null> {
    const { biodatas } = getCollections();
    return (await biodatas.findOne({ _id: id })) as Biodata | null;
  },

  async findByBiodataId(biodataId: number): Promise<Biodata | null> {
    const { biodatas } = getCollections();
    return (await biodatas.findOne({ biodataId })) as Biodata | null;
  },

  async createOrUpdate(biodata: Partial<Biodata> & { userEmail: string }) {
    const { biodatas } = getCollections();
    const existing = await biodatas.findOne({ userEmail: biodata.userEmail });

    if (existing) {
      const result = await biodatas.updateOne(
        { userEmail: biodata.userEmail },
        { $set: biodata }
      );
      return { result, updated: true };
    }

    const lastBiodata = await biodatas.find().sort({ biodataId: -1 }).limit(1).toArray();
    const lastId = lastBiodata.length ? (lastBiodata[0] as Biodata).biodataId ?? 0 : 0;
    biodata.biodataId = lastId + 1;

    const result = await biodatas.insertOne(biodata as Biodata);
    return { result, updated: false };
  },

  async updatePremium(userEmail: string, isPremium: boolean) {
    const { biodatas } = getCollections();
    return biodatas.updateOne({ userEmail }, { $set: { isPremium } });
  },
};
