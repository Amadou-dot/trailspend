'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOptions } from 'react-plaid-link';
import { Button } from '@/components/ui/button';

interface PlaidLinkButtonProps {
  userId: string;
  onSuccess?: () => void;
}

export default function PlaidLinkButton({ userId, onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  // Fetch link token when component mounts
  useEffect(() => {
    const createLinkToken = async () => {
      setIsCreatingToken(true);
      setError(null);
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create link token');
        }
        
        if (data.linkToken) {
          setLinkToken(data.linkToken);
        } else {
          throw new Error('No link token received');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Plaid Link';
        console.error('Error creating link token:', error);
        setError(errorMessage);
      } finally {
        setIsCreatingToken(false);
      }
    };

    createLinkToken();
  }, [userId]);

  // Handle successful account linking
  const handleOnSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken) => {
      setLoading(true);
      try {
        // Exchange public token for access token
        const response = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicToken, userId }),
        });

        if (response.ok) {
          // Sync transactions
          await fetch('/api/plaid/sync-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          // Sync recurring transactions
          await fetch('/api/plaid/sync-recurring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error) {
        console.error('Error exchanging token:', error);
      } finally {
        setLoading(false);
      }
    },
    [userId, onSuccess]
  );

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: handleOnSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  // Show error message if link token creation failed
  if (error) {
    return (
      <div className="space-y-2">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled
          variant="destructive"
        >
          Connection Failed
        </Button>
        <p className="text-sm text-destructive">
          {error}. Please check your Plaid credentials in .env.local
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={() => open()}
      disabled={!ready || loading || isCreatingToken}
      size="lg"
      className="w-full sm:w-auto"
      data-plaid-link-button
    >
      {loading ? 'Connecting...' : isCreatingToken ? 'Initializing...' : 'Link Bank Account'}
    </Button>
  );
}
