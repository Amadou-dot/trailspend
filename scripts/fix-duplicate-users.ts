/**
 * Migration script to fix duplicate users and add clerkId field
 * 
 * This script helps you:
 * 1. Identify duplicate users created by the Plaid integration
 * 2. Update the correct user with clerkId
 * 3. Migrate transactions/recurring to the correct user
 * 4. Delete duplicate users
 * 
 * Usage: npx tsx scripts/fix-duplicate-users.ts
 */

import connectDB from '../lib/db';
import User from '../lib/models/User';
import Transaction from '../lib/models/Transaction';
import RecurringSubscription from '../lib/models/RecurringSubscription';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function fixDuplicateUsers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // Step 1: Find all users
    const allUsers = await User.find({});
    console.log(`Total users found: ${allUsers.length}\n`);

    // Step 2: Identify duplicates (users with Clerk ID as email)
    const duplicateUsers = allUsers.filter(user => 
      user.email.startsWith('user_') || user.email.startsWith('org_')
    );
    
    console.log(`Found ${duplicateUsers.length} duplicate user(s):\n`);
    duplicateUsers.forEach(user => {
      console.log(`  - ID: ${user._id}`);
      console.log(`    Email (ClerkId): ${user.email}`);
      console.log(`    Accounts Linked: ${user.accountsLinked}`);
      console.log(`    Institution: ${user.plaidInstitutionName || 'N/A'}\n`);
    });

    // Step 3: Find legitimate users (with real emails)
    const legitUsers = allUsers.filter(user => 
      !user.email.startsWith('user_') && !user.email.startsWith('org_')
    );
    
    console.log(`Found ${legitUsers.length} legitimate user(s):\n`);
    legitUsers.forEach(user => {
      console.log(`  - ID: ${user._id}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Name: ${user.name || 'N/A'}`);
      console.log(`    Accounts Linked: ${user.accountsLinked}\n`);
    });

    // Step 4: Process each duplicate
    for (const duplicate of duplicateUsers) {
      const clerkId = duplicate.email; // The "email" is actually the Clerk ID
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing duplicate user with Clerk ID: ${clerkId}`);
      console.log(`${'='.repeat(60)}\n`);

      // Find associated transactions
      const transactions = await Transaction.find({ userId: duplicate._id });
      console.log(`  - Found ${transactions.length} transactions`);

      // Find associated recurring subscriptions
      const recurring = await RecurringSubscription.find({ userId: duplicate._id });
      console.log(`  - Found ${recurring.length} recurring subscriptions`);

      // Check if there's a legitimate user to merge with
      if (legitUsers.length === 1) {
        const legitUser = legitUsers[0];
        console.log(`\n  ✓ Found legitimate user to merge with: ${legitUser.email}`);

        // Update legitimate user with Plaid data from duplicate
        if (duplicate.accountsLinked) {
          console.log(`  → Updating user ${legitUser.email} with Plaid data...`);
          
          await User.findByIdAndUpdate(legitUser._id, {
            clerkId: clerkId,
            plaidAccessToken: duplicate.plaidAccessToken,
            plaidItemId: duplicate.plaidItemId,
            plaidInstitutionId: duplicate.plaidInstitutionId,
            plaidInstitutionName: duplicate.plaidInstitutionName,
            cursor: duplicate.cursor,
            accountsLinked: true,
          });
          
          console.log(`  ✓ User updated with Clerk ID and Plaid data`);
        } else {
          // Just add the Clerk ID
          await User.findByIdAndUpdate(legitUser._id, {
            clerkId: clerkId,
          });
          console.log(`  ✓ User updated with Clerk ID`);
        }

        // Migrate transactions
        if (transactions.length > 0) {
          console.log(`  → Migrating ${transactions.length} transactions...`);
          await Transaction.updateMany(
            { userId: duplicate._id },
            { userId: legitUser._id }
          );
          console.log(`  ✓ Transactions migrated`);
        }

        // Migrate recurring subscriptions
        if (recurring.length > 0) {
          console.log(`  → Migrating ${recurring.length} recurring subscriptions...`);
          await RecurringSubscription.updateMany(
            { userId: duplicate._id },
            { userId: legitUser._id }
          );
          console.log(`  ✓ Recurring subscriptions migrated`);
        }

        // Delete duplicate user
        console.log(`  → Deleting duplicate user...`);
        await User.findByIdAndDelete(duplicate._id);
        console.log(`  ✓ Duplicate user deleted\n`);

      } else {
        console.log(`\n  ⚠ WARNING: Cannot automatically merge - found ${legitUsers.length} legitimate users`);
        console.log(`  Please manually review and merge data for Clerk ID: ${clerkId}\n`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Migration Complete!');
    console.log(`${'='.repeat(60)}\n`);

    // Final summary
    const finalUsers = await User.find({});
    console.log('Final User Summary:');
    for (const user of finalUsers) {
      console.log(`\n  User: ${user.email}`);
      console.log(`    Clerk ID: ${user.clerkId || 'NOT SET'}`);
      console.log(`    Accounts Linked: ${user.accountsLinked}`);
      
      const txCount = await Transaction.countDocuments({ userId: user._id });
      const recCount = await RecurringSubscription.countDocuments({ userId: user._id });
      
      console.log(`    Transactions: ${txCount}`);
      console.log(`    Recurring: ${recCount}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║     Trailspend - Fix Duplicate Users Migration Script       ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

fixDuplicateUsers();
