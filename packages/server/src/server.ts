import Koa from 'koa';
import { createApi, db } from 'rest-easy-loki';

export const collectionName = 'documents';

const port = process.env.LOKI_PORT || '3030';
const dbName = process.env.LOKI_DB || './db/locatieregister.db';
const cors = (process.env.LOKI_CORS || 'true') === 'true';
const sizeLimit = process.env.LOKI_SIZE_LIMIT || '250mb';

export const startService = () => {
  db.startDatabase(dbName, () => {
    const api = createApi({ cors, sizeLimit }) as Koa;

    api.listen(port);
    console.log(`Server running on port ${port}.`);
  });
};
startService();
