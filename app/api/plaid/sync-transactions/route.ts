import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { decrypt } from '@/lib/encryption';

/**
 * POST /api/plaid/sync-transactions
 * Syncs transactions from Plaid and stores them in MongoDB
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

    let cursor = user.cursor || undefined;
    let hasMore = true;
    let added: unknown[] = [];
    let modified: unknown[] = [];
    let removed: unknown[] = [];

    // Fetch all transaction updates
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor,
        options: {
          include_personal_finance_category: true,
        },
      });

      const data = response.data;

      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    // Process added transactions
    for (const txn of added) {
      const t = txn as {
        transaction_id: string;
        account_id: string;
        amount: number;
        iso_currency_code?: string;
        unofficial_currency_code?: string;
        category?: string[];
        category_id?: string;
        merchant_name?: string;
        name: string;
        payment_channel?: string;
        pending: boolean;
        pending_transaction_id?: string;
        date: string;
        authorized_date?: string;
        location?: {
          address?: string;
          city?: string;
          region?: string;
          postal_code?: string;
          country?: string;
          lat?: number;
          lon?: number;
        };
        payment_meta?: {
          reference_number?: string;
          ppd_id?: string;
          payee?: string;
        };
        personal_finance_category?: {
          primary?: string;
          detailed?: string;
          confidence_level?: string;
        };
      };

      await Transaction.findOneAndUpdate(
        { transactionId: t.transaction_id },
        {
          userId: user._id,
          transactionId: t.transaction_id,
          accountId: t.account_id,
          amount: t.amount,
          isoCurrencyCode: t.iso_currency_code,
          unofficialCurrencyCode: t.unofficial_currency_code,
          category: t.category,
          categoryId: t.category_id,
          merchantName: t.merchant_name,
          name: t.name,
          paymentChannel: t.payment_channel,
          pending: t.pending,
          pendingTransactionId: t.pending_transaction_id,
          date: new Date(t.date),
          authorizedDate: t.authorized_date ? new Date(t.authorized_date) : undefined,
          location: t.location,
          paymentMeta: t.payment_meta,
          personalFinanceCategory: t.personal_finance_category,
        },
        { upsert: true, new: true }
      );
    }

    // Process modified transactions
    for (const txn of modified) {
      const t = txn as {
        transaction_id: string;
        account_id: string;
        amount: number;
        iso_currency_code?: string;
        unofficial_currency_code?: string;
        category?: string[];
        category_id?: string;
        merchant_name?: string;
        name: string;
        payment_channel?: string;
        pending: boolean;
        pending_transaction_id?: string;
        date: string;
        authorized_date?: string;
        location?: {
          address?: string;
          city?: string;
          region?: string;
          postal_code?: string;
          country?: string;
          lat?: number;
          lon?: number;
        };
        payment_meta?: {
          reference_number?: string;
          ppd_id?: string;
          payee?: string;
        };
        personal_finance_category?: {
          primary?: string;
          detailed?: string;
          confidence_level?: string;
        };
      };

      await Transaction.findOneAndUpdate(
        { transactionId: t.transaction_id },
        {
          amount: t.amount,
          isoCurrencyCode: t.iso_currency_code,
          unofficialCurrencyCode: t.unofficial_currency_code,
          category: t.category,
          categoryId: t.category_id,
          merchantName: t.merchant_name,
          name: t.name,
          paymentChannel: t.payment_channel,
          pending: t.pending,
          pendingTransactionId: t.pending_transaction_id,
          date: new Date(t.date),
          authorizedDate: t.authorized_date ? new Date(t.authorized_date) : undefined,
          location: t.location,
          paymentMeta: t.payment_meta,
          personalFinanceCategory: t.personal_finance_category,
        }
      );
    }

    // Process removed transactions
    for (const txn of removed) {
      const t = txn as { transaction_id: string };
      await Transaction.deleteOne({ transactionId: t.transaction_id });
    }

    // Update user's cursor
    await User.findByIdAndUpdate(user._id, { cursor });

    return NextResponse.json({
      success: true,
      added: added.length,
      modified: modified.length,
      removed: removed.length,
    });
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}
