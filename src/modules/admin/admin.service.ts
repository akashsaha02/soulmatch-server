import { getCollections } from '../../config/database';

export const adminService = {
  async getStats() {
    const {
      users,
      biodatas,
      contactRequests,
      premiumRequests,
      successStories,
    } = getCollections();

    const [revenueResult] = await contactRequests
      .aggregate([{ $group: { _id: null, totalAmount: { $sum: '$amount' } } }])
      .toArray();

    return {
      users: await users.countDocuments(),
      biodatas: await biodatas.countDocuments(),
      contactRequests: await contactRequests.countDocuments(),
      premiumRequests: await premiumRequests.countDocuments(),
      successStories: await successStories.countDocuments(),
      maleBiodataCount: await biodatas.countDocuments({ biodataType: 'Male' }),
      femaleBiodataCount: await biodatas.countDocuments({ biodataType: 'Female' }),
      premiumBiodatas: await biodatas.countDocuments({ isPremium: true }),
      totalRevenue: (revenueResult as { totalAmount?: number })?.totalAmount ?? 0,
    };
  },
};
