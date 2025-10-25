import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trailspend - Smart Spending Manager",
  description: "Track your spending, manage subscriptions, and gain insights into your financial habits with Trailspend.",
  keywords: ["spending tracker", "subscription manager", "personal finance", "budget", "transactions"],
  authors: [{ name: "Trailspend" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://trailspend.com'),
  openGraph: {
    title: "Trailspend - Smart Spending Manager",
    description: "Track your spending, manage subscriptions, and gain insights into your financial habits.",
    url: "https://trailspend.com",
    siteName: "Trailspend",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trailspend - Smart Spending Manager",
    description: "Track your spending, manage subscriptions, and gain insights into your financial habits.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen bg-background">
          {/* Navigation */}
          <nav className="border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                  <Link href="/" className="text-xl font-bold text-primary">
                    Trailspend
                  </Link>
                  <div className="hidden md:flex gap-6">
                    <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/recurring" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Recurring
                    </Link>
                    <Link href="/spending" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Spending
                    </Link>
                    <Link href="/transactions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Transactions
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          {/* Main Content */}
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Trailspend. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
