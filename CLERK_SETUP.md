# Clerk Authentication Setup Guide

This guide will help you complete the Clerk authentication integration for Trailspend.

## ✅ What's Already Done

1. **Clerk SDK Installed**: `@clerk/nextjs@^6.34.0` is already in your dependencies
2. **Middleware Created**: `middleware.ts` with `clerkMiddleware()` protects all routes except `/sign-in`
3. **Layout Wrapped**: Your `app/layout.tsx` is now wrapped with `<ClerkProvider>`
4. **UI Components Added**: Sign-in button and user profile button added to navigation
5. **Custom Sign-In Page**: Created at `app/sign-in/[[...sign-in]]/page.tsx`
6. **Root Redirect**: Home page (`/`) redirects to `/dashboard` if signed in, or `/sign-in` if not
7. **Environment Variables**: Configured for custom sign-in page
8. **Security**: `.gitignore` properly excludes `.env*` files

## 🔧 Setup Steps

### 1. Get Your Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
2. Sign up or log in to your Clerk account
3. Create a new application or select an existing one
4. Copy your **Publishable Key** and **Secret Key**

### 2. Update Environment Variables

Open `.env.local` and replace the placeholder values:

```bash
# Replace these with your actual keys from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Your actual publishable key
CLERK_SECRET_KEY=sk_test_... # Your actual secret key
```

⚠️ **IMPORTANT**: 
- Never commit real keys to Git. The `.env.local` file is already in `.gitignore`.
- **Sign-up is disabled** for this application. Only existing users can sign in.

### 3. Configure Clerk Dashboard

In your Clerk Dashboard, you need to:

1. **Disable Public Sign-ups**:
   - Go to **User & Authentication** → **Email, Phone, Username**
   - Disable sign-ups or configure to invitation-only mode
   - This ensures only authorized users can access the application

2. **Add Users Manually** (if needed):
   - Go to **Users** in the Clerk Dashboard
   - Click **Create User** to add authorized users
   - They will receive an invitation to set up their account

### 4. Start Your Development Server

```bash
pnpm dev
```

### 5. Test Authentication

1. Navigate to `http://localhost:3000` (will redirect to `/sign-in`)
2. Sign in with an authorized account
3. Verify you're redirected to `/dashboard`
4. Check that the user profile button appears in navigation

## 🎯 What's Included

### Middleware (`middleware.ts`)
- Uses the current `clerkMiddleware()` from `@clerk/nextjs/server`
- **Protects all routes except `/sign-in`** - users must be authenticated to access any page
- Automatically runs for all API routes
- Redirects unauthenticated users to the sign-in page

### Root Page (`app/page.tsx`)
- Automatically redirects signed-in users to `/dashboard`
- Redirects non-authenticated users to `/sign-in`
- No public landing page (app is sign-in only)

### Custom Sign-In Page (`app/sign-in/[[...sign-in]]/page.tsx`)
- Full-page custom sign-in experience
- Styled to match your application theme
- Uses Clerk's `<SignIn />` component
- Redirects to `/dashboard` after successful sign-in

### Layout (`app/layout.tsx`)
- Wraps entire app with `<ClerkProvider>`
- Maintains your existing theme provider and layout structure

### Navigation (`components/MobileNav.tsx`)
- **Signed Out**: Shows "Sign In" button that links to `/sign-in`
- **Signed In**: Shows user profile button with sign-out option (redirects to `/sign-in` after sign-out)
- Works on both desktop and mobile views

## 🔒 Route Protection

Your application is configured to **require authentication for all routes** except the sign-in page.

### Current Configuration

The middleware protects all routes by default:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

### How It Works

- ✅ **Protected Routes**: `/dashboard`, `/recurring`, `/spending`, `/transactions`, all API routes
- ✅ **Public Routes**: `/sign-in` only
- ✅ **Automatic Redirect**: Non-authenticated users are automatically redirected to `/sign-in`
- ✅ **Root Redirect**: `/` automatically redirects to `/dashboard` (signed in) or `/sign-in` (signed out)

### Adding Additional Public Routes (Optional)

If you need to make other routes public (e.g., a terms of service page), update the middleware:

```typescript
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/terms',
  '/privacy',
]);
```

## 🔐 Using Authentication in Your Code

### Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome, User: {userId}</div>;
}
```

### Server Actions and API Routes

```typescript
// app/api/some-route/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Your logic here
  return NextResponse.json({ data: "protected data" });
}
```

### Client Components

```typescript
'use client';

import { useUser } from "@clerk/nextjs";

export default function ProfileComponent() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }
  
  return <div>Hello, {user.firstName}!</div>;
}
```

## 🎨 Customization

### Disabling Sign-Ups

**Sign-ups are disabled for this application.** To configure this in Clerk:

1. Go to your Clerk Dashboard
2. Navigate to **User & Authentication** → **Restrictions**
3. Enable **"Disable sign-ups"** or configure invitation-only mode
4. Save your changes

This ensures only users you manually add can access the application.

### Adding Users

To add authorized users to your application:

1. Go to **Users** in the Clerk Dashboard
2. Click **Create User**
3. Enter the user's email address
4. Optionally set a password or send an invitation email
5. The user can then sign in at `/sign-in`

### Customizing the Sign-In Page

The sign-in page is located at `app/sign-in/[[...sign-in]]/page.tsx`. You can customize:

- Header text and descriptions
- Layout and styling
- Clerk component appearance

### Theme Customization

Clerk automatically inherits your app's theme. For more control:

```typescript
// app/layout.tsx
<ClerkProvider
  appearance={{
    baseTheme: dark, // or light
    variables: {
      colorPrimary: "hsl(var(--primary))",
      colorBackground: "hsl(var(--background))",
    },
  }}
>
  {/* ... */}
</ClerkProvider>
```

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Authentication Helpers](https://clerk.com/docs/references/nextjs/auth)
- [Customization](https://clerk.com/docs/customization/overview)

## 🐛 Troubleshooting

### "Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()"
- Make sure `middleware.ts` is at the root of your project (not in `app/` folder)
- Restart your dev server after creating the middleware

### Sign-in button not working
- Verify your environment variables are set correctly
- Check that you're using the correct keys (publishable key should start with `pk_`)
- Restart your dev server after adding environment variables

### User data not showing
- Make sure you're awaiting `auth()` in server components
- Check that `isLoaded` is true before accessing user data in client components

## ✨ Next Steps

1. Set up your Clerk account and get API keys
2. Update `.env.local` with your real keys
3. Test the sign-in flow
4. Protect your routes as needed
5. Integrate user data with your existing MongoDB models
6. Consider adding user metadata to sync with your database

---

**Need Help?** Check the [Clerk Discord](https://clerk.com/discord) or [documentation](https://clerk.com/docs).
