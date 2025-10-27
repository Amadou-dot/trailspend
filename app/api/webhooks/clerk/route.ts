import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  console.log('[Clerk Webhook] Received webhook request');
  
  if (!webhookSecret) {
    console.error('[Clerk Webhook] CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  console.log('[Clerk Webhook] Headers:', {
    svix_id,
    svix_timestamp,
    has_signature: !!svix_signature,
  });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('[Clerk Webhook] Missing svix headers');
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the raw body as text (important for signature verification)
  const body = await req.text();
  
  console.log('[Clerk Webhook] Received payload');

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: {
    type: string;
    data: {
      id: string;
      email_addresses: Array<{ id: string; email_address: string }>;
      primary_email_address_id?: string;
      first_name?: string;
      last_name?: string;
    };
  };

  // Verify the webhook (svix will parse the JSON for us)
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as typeof evt;
    console.log('[Clerk Webhook] Webhook verified successfully');
    console.log('[Clerk Webhook] Payload type:', evt.type);
  } catch (err) {
    console.error('[Clerk Webhook] Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, primary_email_address_id } = evt.data;

  console.log('[Clerk Webhook] Processing event:', {
    eventType,
    userId: id,
    emailCount: email_addresses?.length || 0,
  });

  await connectDB();

  try {
    if (eventType === 'user.created') {
      // Create user in MongoDB when they sign up
      const primaryEmail = email_addresses.find(
        (email: { id: string; email_address: string }) => email.id === primary_email_address_id
      );
      
      const userData = {
        clerkId: id,
        email: primaryEmail?.email_address || email_addresses[0]?.email_address,
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || undefined,
        accountsLinked: false,
      };

      console.log('[Clerk Webhook] Creating user:', userData);
      
      try {
        await User.create(userData);
        console.log('[Clerk Webhook] User created in MongoDB:', id);
      } catch (createError: unknown) {
        // Check if it's a duplicate key error
        if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 11000) {
          console.log('[Clerk Webhook] User already exists, updating instead:', id);
          await User.findOneAndUpdate(
            { clerkId: id },
            userData,
            { upsert: true }
          );
        } else {
          throw createError;
        }
      }
    } else if (eventType === 'user.updated') {
      // Update user in MongoDB when they update their profile
      const primaryEmail = email_addresses.find(
        (email: { id: string; email_address: string }) => email.id === primary_email_address_id
      );
      
      const updateData = {
        email: primaryEmail?.email_address || email_addresses[0]?.email_address,
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || undefined,
      };

      console.log('[Clerk Webhook] Updating user:', id, updateData);
      
      await User.findOneAndUpdate(
        { clerkId: id },
        updateData
      );

      console.log('[Clerk Webhook] User updated in MongoDB:', id);
    } else if (eventType === 'user.deleted') {
      // Delete user from MongoDB when they delete their account
      console.log('[Clerk Webhook] Deleting user:', id);
      await User.findOneAndDelete({ clerkId: id });
      console.log('[Clerk Webhook] User deleted from MongoDB:', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Clerk Webhook] Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
