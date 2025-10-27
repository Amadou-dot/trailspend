"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function SignUpPage() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join Trailspend
          </h1>
          <p className="text-muted-foreground">
            Create an account to start tracking your spending and subscriptions
          </p>
        </div>
        <SignUp 
          appearance={{
            baseTheme: resolvedTheme === "dark" ? dark : undefined,
            elements: {
              formButtonPrimary: 
                "bg-primary text-primary-foreground hover:bg-primary/90",
              card: "shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: 
                "border-input hover:bg-accent hover:text-accent-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: 
                "border-input bg-background text-foreground focus:ring-primary",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
        />
      </div>
    </div>
  );
}
