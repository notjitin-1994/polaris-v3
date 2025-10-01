#!/usr/bin/env tsx

/**
 * Script to clean up duplicate blueprint generations
 * This script finds blueprints with multiple generations and keeps only the latest completed one
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BlueprintVersion {
  id: string;
  user_id: string;
  version: number;
  status: string;
  created_at: string;
}

async function findDuplicates(): Promise<{ [userId: string]: BlueprintVersion[] }> {
  console.log('🔍 Finding blueprints with multiple generations...');

  const { data: blueprints, error } = await supabase
    .from('blueprint_generator')
    .select('id, user_id, version, status, created_at')
    .order('user_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching blueprints:', error);
    throw error;
  }

  // Group by user_id to find duplicates
  const duplicates: { [userId: string]: BlueprintVersion[] } = {};

  blueprints?.forEach((blueprint) => {
    if (!duplicates[blueprint.user_id]) {
      duplicates[blueprint.user_id] = [];
    }
    duplicates[blueprint.user_id].push(blueprint);
  });

  // Filter to only include users with multiple generations
  const usersWithDuplicates: { [userId: string]: BlueprintVersion[] } = {};
  Object.entries(duplicates).forEach(([userId, versions]) => {
    if (versions.length > 1) {
      usersWithDuplicates[userId] = versions;
    }
  });

  return usersWithDuplicates;
}

async function cleanupUserDuplicates(
  userId: string,
  versions: BlueprintVersion[]
): Promise<number> {
  console.log(`\n👤 User ${userId}: Found ${versions.length} generations`);

  // Find the latest completed version
  const completedVersions = versions.filter((v) => v.status === 'completed');
  if (completedVersions.length === 0) {
    console.log(`   ⚠️  No completed versions found, skipping cleanup`);
    return 0;
  }

  const latestCompleted = completedVersions[0]; // Already sorted by created_at desc
  console.log(`   ✅ Keeping version ${latestCompleted.version} (${latestCompleted.status})`);

  // Delete all other versions
  const versionsToDelete = versions.filter((v) => v.id !== latestCompleted.id).map((v) => v.id);

  if (versionsToDelete.length === 0) {
    console.log(`   ℹ️  No duplicates to remove`);
    return 0;
  }

  console.log(`   🗑️  Deleting ${versionsToDelete.length} duplicate(s)...`);

  const { error } = await supabase.from('blueprint_generator').delete().in('id', versionsToDelete);

  if (error) {
    console.error(`   ❌ Error deleting duplicates:`, error);
    throw error;
  }

  console.log(`   ✅ Successfully removed ${versionsToDelete.length} duplicate(s)`);
  return versionsToDelete.length;
}

async function main() {
  try {
    console.log('🚀 Starting duplicate cleanup process...\n');

    const duplicates = await findDuplicates();
    const userIds = Object.keys(duplicates);

    if (userIds.length === 0) {
      console.log('✅ No duplicates found! All blueprints have only one generation.');
      return;
    }

    console.log(`📊 Found ${userIds.length} user(s) with duplicate generations\n`);

    let totalRemoved = 0;
    for (const userId of userIds) {
      const removed = await cleanupUserDuplicates(userId, duplicates[userId]);
      totalRemoved += removed;
    }

    console.log(`\n🎉 Cleanup complete!`);
    console.log(`📈 Total duplicates removed: ${totalRemoved}`);
    console.log(`👥 Users affected: ${userIds.length}`);
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
