import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { CountryCode, Products } from 'plaid';

/**
 * POST /api/plaid/create-link-token
 * Creates a link token for Plaid Link initialization
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const configs = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Trailspend',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      transactions: {
        days_requested: 730, // Request 2 years of transaction history
      },
    };

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    const linkToken = createTokenResponse.data.link_token;

    return NextResponse.json({ linkToken });
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error('Error creating link token:', error);
    console.error('Plaid error response:', err.response?.data);
    return NextResponse.json(
      { 
        error: 'Failed to create link token',
        details: err.response?.data || err.message 
      },
      { status: 500 }
    );
  }
}
