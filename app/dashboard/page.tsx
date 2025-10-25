import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import RecurringSubscription from '@/lib/models/RecurringSubscription';
import { formatCurrency, formatDate } from '@/lib/helpers';
import SpendingPeriodSelector from '@/components/SpendingPeriodSelector';

interface DashboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await connectDB();

  // Await searchParams in Next.js 15+
  const params = await searchParams;

  // Find the demo user
  const user = await User.findOne({ email: 'user-demo-123' });
  
  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your spending and subscriptions</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground text-center">
              No account linked yet.{' '}
              <Link href="/" className="text-primary underline">
                Link your bank account to get started
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get all transactions for demo user
  const allTransactions = await Transaction.find({ userId: user._id }).lean();
  
  // Calculate date range based on query param
  const period = params.period || '30';
  let periodLabel = '';
  let startDate: Date | null = null;
  
  if (period === 'month') {
    // First day of current month
    startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    periodLabel = 'This month';
  } else if (period === 'all') {
    startDate = null;
    periodLabel = 'All time';
  } else {
    // Last N days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    periodLabel = period === '30' ? 'Last 30 days' :
                  period === '90' ? 'Last 90 days' :
                  period === '180' ? 'Last 6 months' :
                  period === '365' ? 'Last year' : `Last ${period} days`;
  }
  
  // Plaid convention: positive amount = outflow (expense), negative amount = inflow (income)
  const recentTransactions = allTransactions.filter(
    (t) => t.amount > 0 && (period === 'all' || new Date(t.date) >= startDate!)
  );
  
  const totalSpending =
    recentTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Get active subscriptions (MATURE status means active recurring payment)
  const subscriptions = await RecurringSubscription.find({ 
    userId: user._id,
    isActive: true,
    flowType: 'OUTFLOW' // Only show subscriptions (expenses), not income streams
  }).lean();
  
  const monthlySubscriptionTotal = subscriptions
    .filter((s) => s.frequency === 'MONTHLY')
    .reduce((sum, s) => sum + Math.abs(s.lastAmount), 0);

  // Calculate upcoming bills (next 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  const upcomingBills = subscriptions.filter((s) => {
    const nextDate = new Date(s.lastDate);
    return nextDate <= sevenDaysFromNow;
  });
  
  const upcomingBillsTotal = upcomingBills.reduce(
    (sum, s) => sum + Math.abs(s.lastAmount),
    0
  );

  // Get latest 5 transactions
  const latestTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate spending by category
  const categoryTotals = recentTransactions.reduce((acc, t) => {
    const category = t.personalFinanceCategory?.primary || 'Other';
    acc[category] = (acc[category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Overview of your spending and subscriptions</p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardDescription>Total Spending</CardDescription>
              <SpendingPeriodSelector defaultValue="30" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold">{formatCurrency(totalSpending)}</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {periodLabel} • {recentTransactions.length} transaction{recentTransactions.length !== 1 ? 's' : ''}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subscriptions</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{subscriptions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(monthlySubscriptionTotal)}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>All Transactions</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{allTransactions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total recorded
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Bills</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{formatCurrency(upcomingBillsTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Next 7 days • {upcomingBills.length} bill{upcomingBills.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Subscriptions</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{formatCurrency(monthlySubscriptionTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {subscriptions.filter(s => s.frequency === 'MONTHLY').length} active subscription{subscriptions.filter(s => s.frequency === 'MONTHLY').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Recent Transactions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your latest spending activity</CardDescription>
          </CardHeader>
          <CardContent>
            {latestTransactions.length > 0 ? (
              <div className="space-y-3">
                {latestTransactions.map((t) => (
                  <div key={t.transactionId} className="flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{t.merchantName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                    </div>
                    <Badge variant={t.amount > 0 ? 'destructive' : 'default'} className="text-xs shrink-0">
                      {formatCurrency(t.amount > 0 ? t.amount : Math.abs(t.amount))}
                    </Badge>
                  </div>
                ))}
                <Link href="/transactions" className="text-xs sm:text-sm text-primary hover:underline block mt-4">
                  View all transactions →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No transactions yet.{' '}
                <Link href="/" className="text-primary underline">
                  Link your bank account
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Spending by Category</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center gap-3">
                    <p className="text-xs sm:text-sm font-medium truncate flex-1">{category}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground shrink-0">{formatCurrency(amount)}</p>
                  </div>
                ))}
                <Link href="/spending" className="text-xs sm:text-sm text-primary hover:underline block mt-4">
                  View detailed breakdown →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No spending data yet.{' '}
                <Link href="/" className="text-primary underline">
                  Link your bank account
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
