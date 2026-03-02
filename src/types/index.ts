import type { ObjectId } from 'mongodb';

export interface AuthPayload {
  email: string;
  [key: string]: unknown;
}

export interface User {
  _id?: ObjectId;
  email: string;
  name?: string;
  role: 'admin' | 'premium' | 'normal';
  [key: string]: unknown;
}

export interface Biodata {
  _id?: ObjectId;
  biodataId?: number;
  userEmail: string;
  name?: string;
  biodataType?: 'Male' | 'Female';
  profileImage?: string;
  mobileNumber?: string;
  dob?: string;
  isPremium?: boolean;
  [key: string]: unknown;
}

export interface ContactRequest {
  _id?: ObjectId;
  email: string;
  biodataId?: number;
  status?: string;
  mobileNumber?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface PremiumRequest {
  _id?: ObjectId;
  biodataUniqueId: string;
  biodataId: number;
  userEmail: string;
  userName?: string;
  status: 'pending' | 'approved';
  [key: string]: unknown;
}

export interface SuccessStory {
  _id?: ObjectId;
  selfBiodataId: string | number;
  partnerBiodataId: string | number;
  selfDetails: { name?: string; photo?: string; birthday?: string };
  partnerDetails: { name?: string; photo?: string; birthday?: string };
  coupleImage?: string;
  successStory?: string;
  marriageDate?: string;
  rating?: number;
  date?: Date;
  [key: string]: unknown;
}

export interface Favourite {
  _id?: ObjectId;
  email: string;
  favouriteEmail: string;
  favouriteBiodataId: string | number;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      decoded?: AuthPayload;
    }
  }
}
