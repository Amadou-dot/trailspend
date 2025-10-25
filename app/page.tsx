import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PlaidLinkButton from '@/components/PlaidLinkButton';

export default function Home() {
  // For demo purposes, using a placeholder userId
  // In production, this would come from your auth system
  // Note: Plaid requires client_user_id to NOT contain sensitive info like emails
  const userId = 'user-demo-123';

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8 sm:py-12 px-4">
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.svg" 
            alt="Trailspend Logo" 
            width={120} 
            height={120}
            className="w-24 h-24 sm:w-32 sm:h-32"
            priority
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Take Control of Your{' '}
          <span className="text-primary">Spending</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Track subscriptions, analyze spending patterns, and gain insights into your financial habits with Trailspend.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 px-4">
          <PlaidLinkButton userId={userId} />
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-4">
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
      <section className="space-y-6 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">How It Works</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center space-y-2">
            <div className="text-3xl sm:text-4xl font-bold text-primary">1</div>
            <h3 className="text-lg sm:text-xl font-semibold">Connect Your Bank</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Securely link your bank account using Plaid&apos;s industry-leading technology
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl sm:text-4xl font-bold text-primary">2</div>
            <h3 className="text-lg sm:text-xl font-semibold">Sync Transactions</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              We automatically import and categorize your transactions
            </p>
          </div>
          <div className="text-center space-y-2 sm:col-span-2 md:col-span-1">
            <div className="text-3xl sm:text-4xl font-bold text-primary">3</div>
            <h3 className="text-lg sm:text-xl font-semibold">Get Insights</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
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
