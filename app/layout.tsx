import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileNav from "@/components/MobileNav";
import { ThemeProvider } from "@/components/theme-provider";

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
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: "Trailspend - Smart Spending Manager",
    description: "Track your spending, manage subscriptions, and gain insights into your financial habits.",
    url: "https://trailspend.com",
    siteName: "Trailspend",
    type: "website",
    images: [
      {
        url: '/logo.svg',
        width: 200,
        height: 200,
        alt: 'Trailspend Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trailspend - Smart Spending Manager",
    description: "Track your spending, manage subscriptions, and gain insights into your financial habits.",
    images: ['/logo.svg'],
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            {/* Navigation */}
            <MobileNav />
          
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
        </ThemeProvider>
      </body>
    </html>
  );
}
