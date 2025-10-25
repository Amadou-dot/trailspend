import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  throw new Error('Missing Plaid credentials. Please set PLAID_CLIENT_ID and PLAID_SECRET in .env.local');
}

// Map environment string to Plaid environment
const getPlaidEnvironment = () => {
  switch (PLAID_ENV) {
    case 'production':
      return PlaidEnvironments.production;
    case 'development':
      return PlaidEnvironments.development;
    case 'sandbox':
    default:
      return PlaidEnvironments.sandbox;
  }
};

// Configure Plaid client
const configuration = new Configuration({
  basePath: getPlaidEnvironment(),
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

// Create and export Plaid client instance
export const plaidClient = new PlaidApi(configuration);

// Helper to get Plaid environment info
export const getPlaidConfig = () => ({
  clientId: PLAID_CLIENT_ID,
  env: PLAID_ENV,
  environment: getPlaidEnvironment(),
});
