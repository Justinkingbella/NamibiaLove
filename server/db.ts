import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Create a client with connection string from environment
const connectionString = 'postgresql://neondb_owner:npg_JrGk2p8gUlQn@ep-weathered-tooth-a59sllev-pooler.us-east-2.aws.neon.tech/love?sslmode=require';
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });