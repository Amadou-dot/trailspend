import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { encrypt } from '@/lib/encryption';
import { CountryCode } from 'plaid';

/**
 * POST /api/plaid/exchange-token
 * Exchanges a public token for an access token and stores it securely
 */
export async function POST(request: NextRequest) {
  try {
    const { publicToken, userId } = await request.json();

    if (!publicToken || !userId) {
      return NextResponse.json(
        { error: 'Public token and user ID are required' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get institution info
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });

    const institutionId = itemResponse.data.item.institution_id;
    
    let institutionName = 'Unknown Institution';
    if (institutionId) {
      try {
        const institutionResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        });
        institutionName = institutionResponse.data.institution.name;
      } catch (err) {
        console.error('Error fetching institution:', err);
      }
    }

    // Encrypt the access token before storing
    const encryptedAccessToken = encrypt(accessToken);

    // Connect to database and save user data
    await connectDB();

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plaidAccessToken: encryptedAccessToken,
        plaidItemId: itemId,
        plaidInstitutionId: institutionId,
        plaidInstitutionName: institutionName,
        accountsLinked: true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please ensure you are signed in.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      institutionName,
      user: {
        id: user._id,
        email: user.email,
        accountsLinked: user.accountsLinked,
      },
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
