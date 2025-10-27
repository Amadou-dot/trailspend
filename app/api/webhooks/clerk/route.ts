import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
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

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: {
    type: string;
    data: {
      id: string;
      email_addresses: Array<{ id: string; email_address: string }>;
      primary_email_address_id: string;
      first_name?: string;
      last_name?: string;
    };
  };

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as typeof evt;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name } = evt.data;

  await connectDB();

  try {
    if (eventType === 'user.created') {
      // Create user in MongoDB when they sign up
      const primaryEmail = email_addresses.find((email: { id: string; email_address: string }) => email.id === evt.data.primary_email_address_id);
      
      await User.create({
        clerkId: id,
        email: primaryEmail?.email_address || email_addresses[0]?.email_address,
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || undefined,
        accountsLinked: false,
      });

      console.log('User created in MongoDB:', id);
    } else if (eventType === 'user.updated') {
      // Update user in MongoDB when they update their profile
      const primaryEmail = email_addresses.find((email: { id: string; email_address: string }) => email.id === evt.data.primary_email_address_id);
      
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: primaryEmail?.email_address || email_addresses[0]?.email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || undefined,
        }
      );

      console.log('User updated in MongoDB:', id);
    } else if (eventType === 'user.deleted') {
      // Delete user from MongoDB when they delete their account
      await User.findOneAndDelete({ clerkId: id });
      console.log('User deleted from MongoDB:', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
