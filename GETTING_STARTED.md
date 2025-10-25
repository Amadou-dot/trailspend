# 🚀 Quick Start Guide for Trailspend

## What's Been Set Up

Your Trailspend application is now fully configured with:

✅ **Next.js 16** with App Router and TypeScript
✅ **Plaid Integration** for secure bank connections
✅ **MongoDB/Mongoose** for data persistence
✅ **shadcn/ui** components for modern UI
✅ **Encryption** for secure token storage
✅ **Complete API Routes** for Plaid operations
✅ **Four main pages**: Dashboard, Recurring, Spending, Transactions

## 📋 Next Steps to Get Running

### 1. Set Up Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local`:
```env
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox
MONGODB_URI=mongodb://localhost:27017/trailspend
ENCRYPTION_KEY=<paste_generated_key_here>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Plaid Credentials

1. Sign up at: https://dashboard.plaid.com/signup
2. Navigate to: Team Settings → Keys
3. Copy your `client_id` and `sandbox` secret
4. Paste into `.env.local`

### 3. Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod --dbpath /your/data/path
```

**Option B - MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Add to `MONGODB_URI` in `.env.local`

### 4. Run the App

```bash
pnpm dev
```

Visit: http://localhost:3000

### 5. Test with Plaid Sandbox

When linking a bank account in sandbox mode, use:
- **Username**: `user_good`
- **Password**: `pass_good`
- **Institution**: Any (e.g., Chase, Bank of America)

## 🏗️ Project Architecture

```
Frontend (React/Next.js)
    ↓
PlaidLink Component (react-plaid-link)
    ↓ Returns public_token
API Route: /api/plaid/exchange-token
    ↓ Exchanges for access_token
MongoDB (Encrypted Storage)
    ↓
API Routes: /api/plaid/sync-*
    ↓ Fetch data from Plaid
Display in Dashboard/Pages
```

## 📂 Key Files to Know

### Backend/API
- `app/api/plaid/create-link-token/route.ts` - Creates Plaid Link token
- `app/api/plaid/exchange-token/route.ts` - Exchanges public token
- `app/api/plaid/sync-transactions/route.ts` - Syncs transactions
- `app/api/plaid/sync-recurring/route.ts` - Syncs subscriptions

### Models (Database)
- `lib/models/User.ts` - User data with encrypted access token
- `lib/models/Transaction.ts` - Transaction records
- `lib/models/RecurringSubscription.ts` - Subscription data

### Frontend Components
- `components/PlaidLinkButton.tsx` - Bank linking component
- `app/page.tsx` - Landing page
- `app/dashboard/page.tsx` - Dashboard overview
- `app/recurring/page.tsx` - Subscriptions page
- `app/spending/page.tsx` - Spending analysis
- `app/transactions/page.tsx` - Transaction history

### Utilities
- `lib/db.ts` - MongoDB connection
- `lib/plaid.ts` - Plaid client config
- `lib/encryption.ts` - Token encryption/decryption
- `lib/helpers.ts` - Formatting & calculations

## 🔐 Security Features

1. **Encrypted Storage**: Access tokens encrypted with AES-256
2. **Server-Side Only**: All Plaid calls happen in API routes
3. **No Client Exposure**: Secrets never sent to frontend
4. **Environment Variables**: All credentials in `.env.local`

## 🎨 Adding More Features

### Add a new shadcn component:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add chart
```

### Create a new API route:
```typescript
// app/api/my-route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();
  // Your logic here
  return NextResponse.json({ success: true });
}
```

### Add a new page:
```bash
# Create new directory and page
mkdir app/my-page
touch app/my-page/page.tsx
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running: `mongosh`
- Verify connection string in `.env.local`
- For Atlas, check IP whitelist

### Plaid Link Not Opening
- Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` are correct
- Check browser console for errors
- Ensure environment is set to `sandbox` for testing

### Module Not Found Errors
```bash
pnpm install
```

### Type Errors
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## 📚 Resources

- **Plaid Docs**: https://plaid.com/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://www.mongodb.com/docs/
- **shadcn/ui**: https://ui.shadcn.com/

## 🎯 Development Workflow

1. **Start MongoDB** (if local)
2. **Run dev server**: `pnpm dev`
3. **Link bank account** using Plaid Link
4. **Sync data** with API routes
5. **View dashboard** and other pages
6. **Iterate** on features

## 🚀 Ready to Deploy?

See README.md for deployment instructions to Vercel, Netlify, or your preferred hosting platform.

---

**Need Help?** Check the full README.md or open an issue!

Happy coding! 🎉
