import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './env';

const client = new MongoClient(env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const DB_NAME = 'soulmatchDb';

export async function connectDatabase(): Promise<void> {
  await client.connect();
}

export function getCollections() {
  const database = client.db(DB_NAME);
  return {
    users: database.collection('users'),
    biodatas: database.collection('biodatas'),
    favourites: database.collection('favourites'),
    contactRequests: database.collection('contactRequests'),
    premiumRequests: database.collection('premiumRequests'),
    successStories: database.collection('successStories'),
  };
}
