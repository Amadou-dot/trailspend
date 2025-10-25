# Trailspend - Smart Spending ManagerThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern spending management web application built with Next.js, Plaid, MongoDB, and shadcn/ui. Track your spending, manage subscriptions, and gain insights into your financial habits.## Getting Started



![Trailspend](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)First, run the development server:

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)

![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=flat&logo=mongodb)```bash

![Plaid](https://img.shields.io/badge/Plaid-API-blue?style=flat)npm run dev

# or

## 🚀 Featuresyarn dev

# or

- **🔐 Secure Bank Connection**: Connect your bank account securely using Plaid's industry-leading APIpnpm dev

- **📊 Dashboard Overview**: Real-time insights into your spending habits and financial health# or

- **🔄 Recurring Subscriptions**: Automatically detect and track all your subscriptionsbun dev

- **💰 Spending Analysis**: Visualize spending by merchant and category```

- **📝 Transaction History**: Detailed view of all your transactions

- **🎨 Modern UI**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSSOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## 🏗️ ArchitectureYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.



### Tech StackThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



- **Frontend**: Next.js 16 (App Router), React 19, TypeScript## Learn More

- **UI**: shadcn/ui, Tailwind CSS 4

- **Backend**: Next.js API Routes (Server-side)To learn more about Next.js, take a look at the following resources:

- **Database**: MongoDB with Mongoose ORM

- **Authentication**: Plaid Link (react-plaid-link)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **API Integration**: Plaid API for banking data- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



### Security ArchitectureYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



```## Deploy on Vercel

Frontend (Client)

    ↓ public_token (Plaid Link)The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Backend API Routes

    ↓ exchange for access_tokenCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

MongoDB
    ↓ encrypted access_token stored
Plaid API
    ↓ fetch transactions & recurring data
```

**Key Security Features:**
- ✅ Access tokens are encrypted using AES-256 before storage
- ✅ Plaid credentials never exposed to frontend
- ✅ All Plaid API calls happen server-side only
- ✅ Environment variables for sensitive data

## 📁 Project Structure

```
trailspend/
├── app/
│   ├── api/
│   │   └── plaid/
│   │       ├── create-link-token/     # Create Plaid Link token
│   │       ├── exchange-token/        # Exchange public token for access token
│   │       ├── sync-transactions/     # Sync transaction data
│   │       └── sync-recurring/        # Sync recurring subscriptions
│   ├── dashboard/                     # Dashboard page
│   ├── recurring/                     # Recurring subscriptions page
│   ├── spending/                      # Spending analysis page
│   ├── transactions/                  # Transactions page
│   ├── layout.tsx                     # Root layout with navigation
│   ├── page.tsx                       # Home/landing page
│   └── globals.css                    # Global styles
├── components/
│   ├── ui/                            # shadcn/ui components
│   └── PlaidLinkButton.tsx            # Plaid Link integration component
├── lib/
│   ├── models/
│   │   ├── User.ts                    # User model (stores access token)
│   │   ├── Transaction.ts             # Transaction model
│   │   └── RecurringSubscription.ts   # Recurring subscription model
│   ├── db.ts                          # MongoDB connection utility
│   ├── plaid.ts                       # Plaid client configuration
│   ├── encryption.ts                  # Access token encryption/decryption
│   ├── helpers.ts                     # Utility functions
│   └── utils.ts                       # shadcn/ui utilities
└── public/                            # Static assets
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm installed
- MongoDB instance (local or MongoDB Atlas)
- Plaid account ([Sign up here](https://dashboard.plaid.com/signup))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd trailspend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your environment variables:

```env
# Plaid API Keys (Get from https://dashboard.plaid.com/developers/keys)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # Use 'sandbox', 'development', or 'production'

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/trailspend

# Encryption Key (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_32_character_encryption_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Generate Encryption Key

Generate a secure encryption key for access tokens:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `ENCRYPTION_KEY` in `.env.local`.

### 5. Start MongoDB

If using local MongoDB:

```bash
mongod --dbpath /path/to/your/data
```

Or use MongoDB Atlas connection string in `MONGODB_URI`.

### 6. Run the Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🔐 Plaid Setup

### Using Sandbox Mode (Testing)

1. Go to [Plaid Dashboard](https://dashboard.plaid.com/developers/keys)
2. Copy your `client_id` and `sandbox` secret
3. Add them to `.env.local`
4. Use sandbox credentials when testing (no real bank data)

### Plaid Test Credentials (Sandbox)

- **Username**: `user_good`
- **Password**: `pass_good`
- **PIN** (if asked): `1234`

### Moving to Production

1. Complete Plaid's compliance process
2. Update `PLAID_ENV=production` in `.env.local`
3. Use production credentials from Plaid dashboard

## 🗄️ Database Models

### User Model
```typescript
{
  email: string;
  plaidAccessToken: string (encrypted);
  plaidItemId: string;
  plaidInstitutionName: string;
  cursor: string;  // For transaction sync
  accountsLinked: boolean;
}
```

### Transaction Model
```typescript
{
  userId: ObjectId;
  transactionId: string;
  amount: number;
  merchantName: string;
  category: string[];
  date: Date;
  pending: boolean;
  // ... more fields
}
```

### RecurringSubscription Model
```typescript
{
  userId: ObjectId;
  merchantName: string;
  frequency: 'MONTHLY' | 'WEEKLY' | etc;
  lastAmount: number;
  nextPaymentDate: Date;
  isActive: boolean;
  // ... more fields
}
```

## 📡 API Routes

### `/api/plaid/create-link-token` (POST)
Creates a Plaid Link token for frontend initialization.

**Request:**
```json
{ "userId": "user@example.com" }
```

**Response:**
```json
{ "linkToken": "link-sandbox-xxx..." }
```

### `/api/plaid/exchange-token` (POST)
Exchanges public token for access token (backend only).

**Request:**
```json
{
  "publicToken": "public-sandbox-xxx...",
  "userId": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "institutionName": "Chase"
}
```

### `/api/plaid/sync-transactions` (POST)
Syncs transactions from Plaid to MongoDB.

**Request:**
```json
{ "userId": "user@example.com" }
```

### `/api/plaid/sync-recurring` (POST)
Syncs recurring subscriptions from Plaid.

**Request:**
```json
{ "userId": "user@example.com" }
```

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/):
- Button
- Card
- Table
- Badge
- Tabs
- Skeleton

Add more components as needed:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Remember to set all environment variables in your hosting platform:
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV`
- `MONGODB_URI`
- `ENCRYPTION_KEY`
- `NEXT_PUBLIC_APP_URL`

## 🔒 Security Best Practices

1. **Never expose secrets to frontend**: All Plaid API calls are server-side only
2. **Encrypt sensitive data**: Access tokens are encrypted before storage
3. **Use environment variables**: Never hardcode credentials
4. **Secure MongoDB**: Use strong passwords and IP whitelisting
5. **HTTPS in production**: Always use HTTPS for production deployments

## 📝 Future Enhancements

- [ ] User authentication (NextAuth.js)
- [ ] Budget tracking and alerts
- [ ] Export transactions to CSV
- [ ] Spending goals and recommendations
- [ ] Mobile app (React Native)
- [ ] Multi-account support
- [ ] Data visualization charts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Plaid](https://plaid.com/) for banking API
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Next.js](https://nextjs.org/) for the framework
- [MongoDB](https://www.mongodb.com/) for database

---

**Built with ❤️ by the Trailspend team**

For questions or issues, please open an issue on GitHub.
