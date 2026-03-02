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

let connectionPromise: Promise<void> | null = null;

export async function connectDatabase(): Promise<void> {
  if (!connectionPromise) {
    connectionPromise = client.connect().then(() => {});
  }
  await connectionPromise;
}

/** Ensures DB is connected; caches the promise so we only connect once. */
export async function ensureDatabaseConnected(): Promise<void> {
  await connectDatabase();
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
