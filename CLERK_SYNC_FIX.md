# Clerk & MongoDB Sync Fix

## Problem
When users signed up with Clerk, they were added to MongoDB with their email address. However, when they linked a Plaid account, a new duplicate user was created with their Clerk user ID as the email, causing the app to not render any data.

## Root Cause
The Plaid integration routes were using `userId` (Clerk ID) to query MongoDB by email field:
```typescript
User.findOne({ email: userId }) // userId is actually the Clerk ID, not email!
```

With `upsert: true`, this created a new user document instead of updating the existing one.

## Solution
1. **Added `clerkId` field** to the User model as the primary identifier
2. **Updated all Plaid routes** to query by `clerkId` instead of `email`
3. **Created Clerk webhook** to automatically sync user creation/updates to MongoDB
4. **Removed `upsert` option** from exchange-token to prevent duplicate creation

## Changes Made

### 1. User Model (`lib/models/User.ts`)
- Added `clerkId` field (required, unique)
- Added index on `clerkId` for better query performance

### 2. Plaid API Routes
Updated to use `clerkId` instead of `email` for user lookups:
- `/api/plaid/exchange-token/route.ts`
- `/api/plaid/sync-transactions/route.ts`
- `/api/plaid/sync-recurring/route.ts`

### 3. Clerk Webhook (`/api/webhooks/clerk/route.ts`)
Created webhook endpoint to automatically sync users from Clerk to MongoDB:
- `user.created` - Creates user in MongoDB with clerkId
- `user.updated` - Updates user info in MongoDB
- `user.deleted` - Removes user from MongoDB

## Setup Instructions

### 1. Configure Clerk Webhook
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Webhooks section
3. Click "Add Endpoint"
4. Set the endpoint URL: `https://yourdomain.com/api/webhooks/clerk`
5. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the webhook signing secret

### 2. Add Environment Variable
Add to your `.env.local`:
```bash
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Update Existing Users
For existing users in your database, you need to add the `clerkId` field. You can either:

**Option A: Manual Update** (if you have few users)
Update each user document in MongoDB to include their Clerk ID.

**Option B: Migration Script** (create `scripts/migrate-users.ts`)
```typescript
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

async function migrateUsers() {
  await connectDB();
  
  // Find users without clerkId
  const users = await User.find({ clerkId: { $exists: false } });
  
  console.log(`Found ${users.length} users to migrate`);
  
  for (const user of users) {
    // You'll need to manually map emails to Clerk IDs
    // or delete duplicate entries
    console.log(`User: ${user.email}, ID: ${user._id}`);
  }
}

migrateUsers();
```

### 4. Clean Up Duplicate Users
Delete the duplicate users that were created with Clerk IDs as emails:
```javascript
// In MongoDB shell or Compass
db.users.deleteMany({
  email: { $regex: /^user_/ }  // Clerk IDs start with "user_"
})
```

## Testing
1. Sign up a new user with Clerk
2. Check MongoDB - user should be created with `clerkId`
3. Link a Plaid account
4. Verify that the same user document is updated (no duplicate created)
5. Check that transactions are properly associated with the user

## Data Flow
```
User Signs Up (Clerk)
  ↓
Clerk Webhook fires
  ↓
User created in MongoDB with clerkId + email
  ↓
User links bank account (Plaid)
  ↓
exchange-token finds user by clerkId
  ↓
User document updated (no duplicate)
  ↓
Transactions synced with correct userId
```
