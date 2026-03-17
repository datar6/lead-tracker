import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { leads, comments } from './schema.js';

const STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'] as const;

const COMPANIES = [
  'Acme Corp', 'Globex', 'Initech', 'Umbrella Ltd', 'Stark Industries',
  'Wayne Enterprises', 'Oscorp', 'Hooli', 'Pied Piper', 'Dunder Mifflin',
];

const NOTES = [
  'Met at SaaS conference, very interested in enterprise plan.',
  'Requested a follow-up demo next week.',
  'Budget approved, waiting for legal review.',
  'Came in via referral from existing client.',
  null,
  'Decision expected end of quarter.',
  null,
  'Multiple stakeholders involved, needs exec approval.',
  'Pilot program running until end of month.',
  null,
];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomValue(): number | null {
  if (Math.random() < 0.2) return null;
  return Math.round(Math.random() * 50000) / 10 * 100;
}

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const client = postgres(url);
  const db = drizzle(client);

  console.log('Seeding leads...');

  // Insert 50 leads spread across statuses and companies
  const insertedLeads = await db
    .insert(leads)
    .values(
      Array.from({ length: 50 }, (_, i) => ({
        name: `Lead Person ${i + 1}`,
        email: `lead${i + 1}@example.com`,
        company: randomItem(COMPANIES),
        status: randomItem(STATUSES),
        value: randomValue(),
        notes: NOTES[i % NOTES.length],
      })),
    )
    .returning();

  console.log(`Inserted ${insertedLeads.length} leads.`);

  // Add 1-3 comments to the first 15 leads
  const commentRows = insertedLeads.slice(0, 15).flatMap((lead, i) => {
    const count = (i % 3) + 1;
    return Array.from({ length: count }, (_, j) => ({
      leadId: lead.id,
      text: [
        'Initial contact made, scheduled a call.',
        'Sent proposal, awaiting feedback.',
        'Follow-up email sent.',
        'Demo completed successfully.',
        'Contract under review.',
      ][(i + j) % 5],
    }));
  });

  await db.insert(comments).values(commentRows);
  console.log(`Inserted ${commentRows.length} comments.`);

  await client.end();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
