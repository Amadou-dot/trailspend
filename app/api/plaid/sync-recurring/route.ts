import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import RecurringSubscription from '@/lib/models/RecurringSubscription';
import { decrypt } from '@/lib/encryption';

/**
 * POST /api/plaid/sync-recurring
 * Syncs recurring transactions from Plaid
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get user with access token
    const user = await User.findOne({ clerkId: userId }).select('+plaidAccessToken');

    if (!user || !user.plaidAccessToken) {
      return NextResponse.json(
        { error: 'User not found or no linked accounts' },
        { status: 404 }
      );
    }

    // Decrypt access token
    const accessToken = decrypt(user.plaidAccessToken);

    // Get recurring transactions
    const response = await plaidClient.transactionsRecurringGet({
      access_token: accessToken,
    });

    const { inflow_streams, outflow_streams } = response.data;

    // Process outflow streams (subscriptions/expenses)
    for (const stream of outflow_streams) {
      await RecurringSubscription.findOneAndUpdate(
        { streamId: stream.stream_id },
        {
          userId: user._id,
          streamId: stream.stream_id,
          merchantName: stream.merchant_name || 'Unknown',
          description: stream.description,
          category: stream.category || [],
          frequency: stream.frequency,
          lastAmount: stream.last_amount.amount,
          lastDate: new Date(stream.last_date),
          firstDate: stream.first_date ? new Date(stream.first_date) : undefined,
          isActive: stream.is_active,
          status: stream.status,
          averageAmount: stream.average_amount?.amount,
          flowType: 'OUTFLOW',
          accountId: stream.account_id,
          transactionIds: stream.transaction_ids || [],
          isoCurrencyCode: stream.last_amount.iso_currency_code,
        },
        { upsert: true, new: true }
      );
    }

    // Process inflow streams (income)
    for (const stream of inflow_streams) {
      await RecurringSubscription.findOneAndUpdate(
        { streamId: stream.stream_id },
        {
          userId: user._id,
          streamId: stream.stream_id,
          merchantName: stream.merchant_name || 'Unknown',
          description: stream.description,
          category: stream.category || [],
          frequency: stream.frequency,
          lastAmount: stream.last_amount.amount,
          lastDate: new Date(stream.last_date),
          firstDate: stream.first_date ? new Date(stream.first_date) : undefined,
          isActive: stream.is_active,
          status: stream.status,
          averageAmount: stream.average_amount?.amount,
          flowType: 'INFLOW',
          accountId: stream.account_id,
          transactionIds: stream.transaction_ids || [],
          isoCurrencyCode: stream.last_amount.iso_currency_code,
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      outflowCount: outflow_streams.length,
      inflowCount: inflow_streams.length,
    });
  } catch (error) {
    console.error('Error syncing recurring transactions:', error);
    return NextResponse.json(
      { error: 'Failed to sync recurring transactions' },
      { status: 500 }
    );
  }
}
