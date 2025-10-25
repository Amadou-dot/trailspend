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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View all your transaction history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Recent Transactions</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Merchant</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Category</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                      <TableHead className="hidden md:table-cell whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.transactionId}>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">{formatDate(t.date)}</TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="max-w-[150px] sm:max-w-none truncate">
                            {t.merchantName || 'Unknown'}
                          </div>
                          <div className="sm:hidden text-xs text-muted-foreground">
                            {t.personalFinanceCategory?.primary || 'Other'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                          {t.personalFinanceCategory?.primary || 'Other'}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span className={`text-xs sm:text-sm font-semibold ${t.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {t.amount > 0 ? '-' : '+'}
                            {formatCurrency(Math.abs(t.amount))}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={t.pending ? 'default' : 'outline'} className="text-xs">
                            {t.pending ? 'Pending' : 'Posted'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                No transactions yet.{' '}
                <Link href="/" className="text-primary underline">
                  Link your bank account to get started
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
