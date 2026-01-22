/**
 * Migration script: backfill itinerary ownerId and memberIds
 *
 * - Sets ownerId = created.by for each itinerary (if not already set)
 * - Ensures memberIds includes ownerId
 *
 * Usage:
 * 1. Configure Firebase initialization in this script (Web or Admin SDK).
 * 2. Run with: node scripts/migrate-itinerary-members.js
 *
 * NOTE: This script is provided as a template; update Firebase config/imports
 * to match your environment before running.
 */

// TODO: Replace with your preferred Firebase initialization (Admin SDK recommended for migrations)
// Example (Admin SDK):
// const admin = require('firebase-admin');
// admin.initializeApp();
// const db = admin.firestore();

async function migrateItineraries(db) {
  const snapshot = await db.collection('itineraries').get();
  console.log(`Found ${snapshot.size} itineraries to inspect`);

  const batchSize = 400;
  let batch = db.batch();
  let countInBatch = 0;
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const createdBy = data?.created?.by;

    if (!createdBy) {
      console.warn(`Skipping itinerary ${doc.id}: missing created.by`);
      continue;
    }

    const ownerId = data.ownerId || createdBy;
    const existingMemberIds = Array.isArray(data.memberIds) ? data.memberIds : [];
    const newMemberIds = Array.from(new Set([...existingMemberIds, ownerId]));

    // If nothing changes, skip
    if (data.ownerId === ownerId && existingMemberIds.length === newMemberIds.length) {
      continue;
    }

    batch.update(doc.ref, {
      ownerId,
      memberIds: newMemberIds,
    });

    countInBatch++;
    updatedCount++;

    if (countInBatch >= batchSize) {
      await batch.commit();
      console.log(`Committed batch of ${countInBatch} itinerary updates...`);
      batch = db.batch();
      countInBatch = 0;
    }
  }

  if (countInBatch > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${countInBatch} itinerary updates.`);
  }

  console.log(`Migration complete. Updated ${updatedCount} itineraries.`);
}

// Entry point placeholder
if (require.main === module) {
  console.error('Please wire up Firebase Admin SDK and call migrateItineraries(db). See comments in this file.');
}

