# TrailSpend Import Feature

## Overview

The import feature allows users to upload CSV files from their bank (checking/debit card) or credit card statements and automatically import spending transactions into the database.

## File Structure

```
app/import/
├── page.tsx                      # Protected route for import page
├── actions.ts                    # Server action for CSV processing
└── _components/
    └── ImportCard.tsx           # Client component with file upload UI
```

## How It Works

### 1. **Import Page** (`app/import/page.tsx`)
- Server component that checks authentication
- Redirects unauthenticated users to sign-in
- Renders the ImportCard component

### 2. **Server Action** (`app/import/actions.ts`)
- Handles file upload and processing
- Auto-detects CSV format (Checking vs Credit Card)
- Parses CSV using PapaParse
- Validates data using Zod schemas
- Filters out credits/payments (only imports expenses)
- Creates/updates categories as needed
- Uses upsert to handle duplicates
- Returns detailed import results

### 3. **Import Card** (`app/import/_components/ImportCard.tsx`)
- Client component with drag-and-drop file upload
- Shows CSV format requirements
- Displays real-time upload progress
- Shows detailed import results

## CSV Format

The system auto-detects two CSV formats:

### Checking/Debit Card Format

| Column       | Required | Format      | Example              |
|--------------|----------|-------------|----------------------|
| Posting Date | Yes      | MM/DD/YYYY  | 11/10/2025          |
| Description  | Yes      | Text        | USCONNECT PGISR     |
| Amount       | Yes      | Number      | -3.80               |

### Credit Card Format

| Column       | Required | Format      | Example              |
|--------------|----------|-------------|----------------------|
| Post Date    | Yes      | MM/DD/YYYY  | 11/6/2025           |
| Description  | Yes      | Text        | CIRCLE K 09900      |
| Amount       | Yes      | Number      | -20.8               |
| Category     | Yes      | Text        | Gas                 |

### Important Notes

- **Only expenses are imported** (negative amounts only)
- Credits, payments, and positive amounts are automatically filtered out
- All imported amounts are stored as positive values (absolute value)
- Categories are auto-created from credit card imports
- Duplicate transactions are handled via upsert

Sample files are available:
- `/sample-transactions.csv` (Checking/Debit format)
- `/sample-credit-transactions.csv` (Credit Card format)

## Features

### ✅ Auto-Detection of CSV Format
- Automatically detects Checking/Debit vs Credit Card format
- Uses different Zod schemas for validation
- No manual format selection needed

### ✅ Smart Filtering
- Only imports expenses (negative amounts)
- Filters out credits, payments, and income
- Stores all amounts as positive values

### ✅ Automatic Duplicate Detection
- Uses Prisma upsert with unique constraint: `@@unique([userId, date, description, amount])`
- Updates category if duplicate found (e.g., if checking imported first, then credit)
- No duplicate transactions in database

### ✅ Category Management
- Automatically creates categories from credit card imports
- Uses `upsert` to avoid duplicate categories
- Categories are user-specific
- Checking/debit imports have no category (null)

### ✅ Error Handling
- Validates file type (CSV only)
- Validates required fields per format
- Validates data types with Zod
- Continues processing even if some rows fail
- Reports detailed counts (imported + skipped)

### ✅ User Experience
- Drag-and-drop file upload
- Loading states with spinner
- Success/error alerts
- Detailed import statistics
- Auto-clear on success

## Database Schema

Transactions are stored with the following schema:

```prisma
model Transaction {
  id             String    @id @default(cuid())
  date           DateTime
  description    String
  amount         Float
  vendor         String?
  isSubscription Boolean   @default(false)
  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId     String?
  category       Category? @relation(fields: [categoryId], references: [id])
  
  @@unique([userId, date, description, amount])
}
```

## Navigation

The Import page is accessible via:
- Navigation menu: `/import`
- Direct URL: `https://yourapp.com/import`

## Security

- ✅ Server-side authentication check
- ✅ User-scoped data (transactions tied to userId)
- ✅ Server actions for data processing
- ✅ Input validation and sanitization
