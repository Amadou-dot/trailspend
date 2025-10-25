import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { formatCurrency, formatDate } from '@/lib/helpers';
import Link from 'next/link';

export default async function TransactionsPage() {
  await connectDB();

  // Find the demo user
  const user = await User.findOne({ email: 'user-demo-123' });

  // Get all transactions for demo user, sorted by date
  const transactions = user 
    ? await Transaction.find({ userId: user._id })
        .sort({ date: -1 })
        .limit(100)
        .lean()
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View all your transaction history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.transactionId}>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell className="font-medium">{t.merchantName || 'Unknown'}</TableCell>
                    <TableCell>{t.personalFinanceCategory?.primary || 'Other'}</TableCell>
                    <TableCell className="text-right">
                      <span className={t.amount > 0 ? 'text-red-600' : 'text-green-600'}>
                        {t.amount > 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(t.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.pending ? 'default' : 'outline'}>
                        {t.pending ? 'Pending' : 'Posted'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions yet.{' '}
              <Link href="/" className="text-primary underline">
                Link your bank account to get started
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
