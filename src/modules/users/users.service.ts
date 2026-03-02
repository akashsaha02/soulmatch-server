import type { ObjectId } from 'mongodb';
import { getCollections } from '../../config/database';
import type { User } from '../../types';

export const usersService = {
  async findByEmail(email: string): Promise<User | null> {
    const { users } = getCollections();
    return (await users.findOne({ email })) as User | null;
  },

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 6, search = '' } = params;
    const { users } = getCollections();
    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };
    const skip = (page - 1) * limit;
    const items = await users.find(query).skip(skip).limit(limit).toArray();
    const totalUsers = await users.countDocuments(query);
    return {
      users: items,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  },

  async create(user: Partial<User>) {
    const { users } = getCollections();
    const validRoles = ['admin', 'premium', 'normal'] as const;
    user.role = (validRoles.includes(user.role as never) ? user.role : 'normal') as User['role'];
    const result = await users.insertOne(user as User);
    return result;
  },

  async updateRole(id: ObjectId, role: string, email: string) {
    const { users, biodatas } = getCollections();
    const emailQuery = { userEmail: email };
    if (role === 'premium') {
      await biodatas.updateOne(emailQuery, { $set: { isPremium: true } });
    } else {
      await biodatas.updateOne(emailQuery, { $set: { isPremium: false } });
    }
    return users.updateOne({ _id: id }, { $set: { role } });
  },

  async deleteById(id: ObjectId) {
    const { users } = getCollections();
    return users.deleteOne({ _id: id });
  },
};
