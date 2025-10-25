import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { formatCurrency } from '@/lib/helpers';
import Link from 'next/link';
import SpendingPeriodSelector from '@/components/SpendingPeriodSelector';

interface SpendingPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function SpendingPage({ searchParams }: SpendingPageProps) {
  await connectDB();

  // Await searchParams in Next.js 15+
  const params = await searchParams;

  // Find the demo user
  const user = await User.findOne({ email: 'user-demo-123' });

  // Calculate date range based on query param
  const period = params.period || '30';
  let periodLabel = '';
  let startDate: Date | null = null;
  
  if (period === 'month') {
    // First day of current month
    startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    periodLabel = 'this month';
  } else if (period === 'all') {
    startDate = null;
    periodLabel = 'all time';
  } else {
    // Last N days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    periodLabel = period === '30' ? 'last 30 days' :
                  period === '90' ? 'last 90 days' :
                  period === '180' ? 'last 6 months' :
                  period === '365' ? 'last year' : `last ${period} days`;
  }

  // Plaid convention: positive amount = outflow (expense), negative amount = inflow (income)
  const transactions = user
    ? await Transaction.find({ 
        userId: user._id,
        ...(period !== 'all' && startDate ? { date: { $gte: startDate } } : {}),
        amount: { $gt: 0 } // Only expenses (positive amounts in Plaid)
      }).lean()
    : [];

  // Group by merchant
  const merchantTotals = transactions.reduce((acc, t) => {
    const merchant = t.merchantName || 'Unknown';
    if (!acc[merchant]) {
      acc[merchant] = { total: 0, count: 0 };
    }
    acc[merchant].total += t.amount; // Already positive (expense)
    acc[merchant].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const topMerchants = Object.entries(merchantTotals)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 10);

  // Group by category
  const categoryTotals = transactions.reduce((acc, t) => {
    const category = t.personalFinanceCategory?.primary || 'Other';
    acc[category] = (acc[category] || 0) + t.amount; // Already positive (expense)
    return acc;
  }, {} as Record<string, number>);

  const totalSpending = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Spending Analysis</h1>
          <p className="text-muted-foreground">Understand where your money goes ({periodLabel})</p>
        </div>
        <SpendingPeriodSelector defaultValue="30" />
      </div>

      <Tabs defaultValue="merchants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="merchants">By Merchant</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="merchants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Merchants</CardTitle>
              <CardDescription>Your most frequent spending locations</CardDescription>
            </CardHeader>
            <CardContent>
              {topMerchants.length > 0 ? (
                <div className="space-y-4">
                  {topMerchants.map(([merchant, data]) => (
                    <div key={merchant} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{merchant}</p>
                        <p className="text-sm text-muted-foreground">{data.count} transaction{data.count !== 1 ? 's' : ''}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(data.total)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No spending data yet.{' '}
                  <Link href="/" className="text-primary underline">
                    Link your bank account to get started
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Breakdown of your spending categories</CardDescription>
            </CardHeader>
            <CardContent>
              {topCategories.length > 0 ? (
                <div className="space-y-4">
                  {topCategories.map(([category, amount]) => {
                    const percentage = totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(0) : 0;
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{category}</p>
                          <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(amount)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No spending data yet.{' '}
                  <Link href="/" className="text-primary underline">
                    Link your bank account to get started
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
