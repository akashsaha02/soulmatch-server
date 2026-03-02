import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

if (process.env.VERCEL) {
  connectDatabase().catch(console.error);
} else {
  connectDatabase().then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  }).catch(console.error);
}

export default app;
