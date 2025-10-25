import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PlaidLinkButton from '@/components/PlaidLinkButton';

export default function Home() {
  // For demo purposes, using a placeholder userId
  // In production, this would come from your auth system
  // Note: Plaid requires client_user_id to NOT contain sensitive info like emails
  const userId = 'user-demo-123';

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Take Control of Your{' '}
          <span className="text-primary">Spending</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track subscriptions, analyze spending patterns, and gain insights into your financial habits with Trailspend.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <PlaidLinkButton userId={userId} />
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Dashboard Overview</CardTitle>
            <CardDescription>
              Get a bird&apos;s-eye view of your financial health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              See your total spending, upcoming bills, and monthly trends all in one place. Make informed decisions with clear, actionable insights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔄 Recurring Subscriptions</CardTitle>
            <CardDescription>
              Never miss a subscription payment again
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatically detect and track all your recurring payments. Know exactly when each subscription renews and how much it costs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Spending Analysis</CardTitle>
            <CardDescription>
              Understand where your money goes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visualize spending by merchant and category. Identify opportunities to save and optimize your budget.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">1</div>
            <h3 className="text-xl font-semibold">Connect Your Bank</h3>
            <p className="text-muted-foreground">
              Securely link your bank account using Plaid&apos;s industry-leading technology
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">2</div>
            <h3 className="text-xl font-semibold">Sync Transactions</h3>
            <p className="text-muted-foreground">
              We automatically import and categorize your transactions
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">3</div>
            <h3 className="text-xl font-semibold">Get Insights</h3>
            <p className="text-muted-foreground">
              View detailed analytics and take control of your spending
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 py-12 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Link your bank account in seconds and start tracking your spending today.
        </p>
        <PlaidLinkButton userId={userId} />
      </section>
    </div>
  );
}
