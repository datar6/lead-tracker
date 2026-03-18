import { Global, Module } from '@nestjs/common';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

export const DRIZZLE_TOKEN = Symbol('DRIZZLE_TOKEN');

const drizzleProvider = {
  provide: DRIZZLE_TOKEN,
  useFactory: () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const client = postgres(url, {
      prepare: false,
      max: 1,
    });
    return drizzle(client, { schema });
  },
};

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DrizzleModule {}
