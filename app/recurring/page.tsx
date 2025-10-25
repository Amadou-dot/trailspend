import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import RecurringSubscription from '@/lib/models/RecurringSubscription';
import { formatCurrency, formatDate, getFrequencyLabel } from '@/lib/helpers';
import Link from 'next/link';

export default async function RecurringPage() {
  await connectDB();

  // Find the demo user
  const user = await User.findOne({ email: 'user-demo-123' });

  // Get all active subscriptions (OUTFLOW only = expenses/subscriptions)
  const subscriptions = user
    ? await RecurringSubscription.find({ 
        userId: user._id,
        isActive: true,
        flowType: 'OUTFLOW'
      })
        .sort({ lastAmount: 1 }) // Sort by amount ascending (most negative first)
        .lean()
    : [];

  // Calculate monthly total (convert all frequencies to monthly equivalent)
  const monthlyTotal = subscriptions.reduce((sum, s) => {
    let monthlyAmount = Math.abs(s.lastAmount);
    
    // Convert to monthly equivalent
    switch (s.frequency) {
      case 'WEEKLY':
        monthlyAmount = monthlyAmount * 4.33;
        break;
      case 'BIWEEKLY':
        monthlyAmount = monthlyAmount * 2.17;
        break;
      case 'SEMI_MONTHLY':
        monthlyAmount = monthlyAmount * 2;
        break;
      case 'QUARTERLY':
        monthlyAmount = monthlyAmount / 3;
        break;
      case 'SEMI_ANNUALLY':
        monthlyAmount = monthlyAmount / 6;
        break;
      case 'ANNUALLY':
        monthlyAmount = monthlyAmount / 12;
        break;
    }
    
    return sum + monthlyAmount;
  }, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recurring Subscriptions</h1>
          <p className="text-muted-foreground">Track and manage your recurring payments</p>
        </div>
        <Button>Sync Subscriptions</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <Card key={sub.streamId}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{sub.merchantName}</CardTitle>
                    <CardDescription>{sub.category[0] || 'Subscription'}</CardDescription>
                  </div>
                  <Badge variant={sub.isActive ? 'default' : 'secondary'}>
                    {sub.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">{formatCurrency(Math.abs(sub.lastAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency</span>
                    <span>{getFrequencyLabel(sub.frequency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Payment</span>
                    <span>{formatDate(sub.lastDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                No recurring subscriptions found.{' '}
                <Link href="/" className="text-primary underline">
                  Link your bank account to detect subscriptions
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Total recurring charges per month (estimated)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(monthlyTotal)}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Across {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
