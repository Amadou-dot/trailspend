# Clerk Webhook Troubleshooting Guide

## Common Issues and Solutions

### 1. Webhook Verification Failed (400 Error)

**Symptoms:**
- Clerk dashboard shows webhook failed with 400 status
- Error message: "Webhook verification failed"

**Causes & Solutions:**

#### a) Wrong Webhook Secret
```bash
# Check your .env.local has the correct secret
CLERK_WEBHOOK_SECRET=whsec_...
```

**How to get the correct secret:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Webhooks section
3. Click on your endpoint
4. Copy the "Signing Secret"

#### b) Missing Environment Variable
The secret might not be loaded in production.

**For Vercel/Production:**
1. Add `CLERK_WEBHOOK_SECRET` to your deployment platform's environment variables
2. Redeploy your application

### 2. MongoDB Connection Issues (500 Error)

**Symptoms:**
- Webhook fails with 500 status
- Logs show MongoDB connection errors

**Solution:**
Ensure your `MONGODB_URI` environment variable is set:
```bash
MONGODB_URI=mongodb+srv://...
```

### 3. User Already Exists Error

**Symptoms:**
- Duplicate key error (code 11000)
- User with same email or clerkId already exists

**Solution:**
The updated webhook handler now catches this and updates the existing user instead. If you still see issues:

```javascript
// Manually clean up duplicates in MongoDB
db.users.deleteMany({
  email: { $regex: /^user_/ }  // Remove duplicates with Clerk IDs as emails
})
```

### 4. Missing Primary Email

**Symptoms:**
- User created without email
- Email is undefined or null

**Solution:**
The webhook now falls back to the first email if primary is not found:
```typescript
email: primaryEmail?.email_address || email_addresses[0]?.email_address
```

## Testing Webhooks Locally

### Option 1: Use ngrok (Recommended for Development)

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your dev server:**
   ```bash
   pnpm dev
   ```

3. **Expose your local server:**
   ```bash
   ngrok http 3000
   ```

4. **Update Clerk webhook URL:**
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - In Clerk Dashboard, update webhook endpoint to: `https://abc123.ngrok.io/api/webhooks/clerk`

5. **Test by signing up a new user**

### Option 2: Use Clerk's Test Feature

1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click "Send Test Event"
4. Select `user.created` event
5. Click "Send Test"

## Debugging Checklist

When webhooks fail, check these in order:

- [ ] **Environment Variables Set**
  - `CLERK_WEBHOOK_SECRET` is set
  - `MONGODB_URI` is set
  - Variables are loaded in your environment

- [ ] **Endpoint is Reachable**
  - URL is correct: `https://yourdomain.com/api/webhooks/clerk`
  - SSL certificate is valid (production)
  - No firewall blocking requests

- [ ] **Webhook Configuration in Clerk**
  - Endpoint URL is correct
  - `user.created`, `user.updated`, `user.deleted` events are subscribed
  - Endpoint is active (not paused)

- [ ] **MongoDB Connection**
  - Database is reachable
  - User has write permissions
  - Indexes are created (run app once to create them)

- [ ] **User Model**
  - Has `clerkId` field
  - Has proper indexes
  - No existing users without `clerkId` causing conflicts

## View Webhook Logs

### In Clerk Dashboard:
1. Go to Webhooks section
2. Click on your endpoint
3. View "Recent Deliveries"
4. Click on a specific delivery to see:
   - Request payload
   - Response status
   - Response body
   - Retry attempts

### In Your Application:
Check your application logs for messages prefixed with `[Clerk Webhook]`:

```bash
# For local development
# Logs appear in your terminal where you ran `pnpm dev`

# For production (Vercel)
vercel logs your-deployment-url

# For production (other platforms)
# Check your platform's logging dashboard
```

## Common Log Messages

### Success Messages:
```
[Clerk Webhook] Received webhook request
[Clerk Webhook] Webhook verified successfully
[Clerk Webhook] Creating user: { clerkId: 'user_...', email: '...' }
[Clerk Webhook] User created in MongoDB: user_...
```

### Error Messages:

**Missing Headers:**
```
[Clerk Webhook] Missing svix headers
```
→ Clerk is not sending the webhook or the request is being modified by a proxy

**Verification Failed:**
```
[Clerk Webhook] Error verifying webhook: [error details]
```
→ Wrong webhook secret or payload was modified

**Database Error:**
```
[Clerk Webhook] Error handling webhook: [error details]
```
→ MongoDB connection issue or validation error

## Manual Webhook Test

You can test the endpoint manually (will fail verification but checks reachability):

```bash
npx tsx scripts/test-clerk-webhook.ts
```

## Contact Support

If issues persist after trying these solutions:

1. **Check Clerk Status**: https://status.clerk.com
2. **Clerk Discord**: https://clerk.com/discord
3. **Clerk Support**: support@clerk.com

Include in your support request:
- Webhook delivery ID from Clerk Dashboard
- Error message from logs
- Environment (development/production)
- Timestamp of the failed webhook
