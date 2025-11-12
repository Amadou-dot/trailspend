# Spending Page - Data Table Implementation

## Overview

The Spending page displays all imported transactions in a powerful, filterable, and sortable data table using Shadcn/ui's DataTable pattern with TanStack Table.

## File Structure

```
app/spending/
├── page.tsx           # Server component - fetches data from database
├── columns.tsx        # Column definitions with formatters and actions
└── DataTable.tsx      # Generic reusable data table component
```

## Components

### 1. **Column Definitions** (`columns.tsx`)

Defines how each column in the table should be displayed:

#### Columns:
- **Date** - Sortable, formatted as "MMM DD, YYYY"
- **Description** - Shows transaction description + vendor (if available)
- **Category** - Badge display, shows "Uncategorized" if null
- **Amount** - Sortable, formatted as USD currency
- **Type** - Shows "Subscription" badge if `isSubscription` is true
- **Actions** - Dropdown menu with:
  - Copy transaction ID
  - Edit transaction
  - Mark as subscription
  - Delete transaction

#### Features:
- **Sorting** on Date and Amount columns
- **Custom formatting** for dates and currency
- **Nested data display** (category name via relation)
- **Action menu** for per-row operations

### 2. **DataTable Component** (`DataTable.tsx`)

Generic, reusable table component that handles:

#### Features:
- ✅ **Sorting** - Client-side sorting on any sortable column
- ✅ **Filtering** - Search box filters by description
- ✅ **Pagination** - Navigate through pages of data
- ✅ **Default Sort** - Newest transactions first (date desc)
- ✅ **Row Count** - Shows total filtered transactions
- ✅ **Responsive** - Mobile-friendly table design
- ✅ **Empty State** - "No transactions found" message

#### State Management:
- Sorting state (default: date descending)
- Column filters (description search)
- Column visibility
- Row selection
- Pagination

### 3. **Spending Page** (`page.tsx`)

Server component that:

#### Responsibilities:
- ✅ Authenticates user (redirects if not signed in)
- ✅ Fetches transactions from Prisma
- ✅ Includes category relation
- ✅ Orders by date (newest first)
- ✅ Passes data to client DataTable

#### Query:
```typescript
prisma.transaction.findMany({
  where: { userId: session.user.id },
  include: {
    category: {
      select: { id: true, name: true }
    }
  },
  orderBy: { date: "desc" }
})
```

## Data Flow

1. **Server** - Page fetches transactions from database
2. **Props** - Data passed to DataTable component
3. **Client** - DataTable renders with TanStack Table
4. **User** - Interacts with sorting, filtering, pagination

## UI Features

### Search & Filter
- Search bar filters transactions by description
- Real-time filtering as you type
- Transaction count updates

### Sorting
- Click column headers to sort
- Toggle ascending/descending
- Visual sort indicators (arrow icons)

### Pagination
- Previous/Next buttons
- Page count display
- Configurable page size (default from TanStack)

### Actions Menu
- Per-row dropdown menu
- Copy transaction ID to clipboard
- Edit, mark as subscription, or delete options
- Can be extended with actual implementations

## Styling

- Uses Shadcn/ui components for consistent design
- Tailwind CSS for responsive layouts
- Dark mode support (via theme provider)
- Mobile-responsive table
- Professional typography and spacing

## Future Enhancements

Potential additions:
- [ ] Category filter dropdown
- [ ] Date range picker
- [ ] Export to CSV
- [ ] Bulk actions (select multiple rows)
- [ ] Column visibility toggle
- [ ] Advanced filters (amount range, subscription only, etc.)
- [ ] Actual edit/delete implementations
- [ ] Inline editing
- [ ] Transaction details modal

## Navigation

Access via:
- Navigation menu: `/spending`
- Direct URL: `https://yourapp.com/spending`

## Performance

- Server-side data fetching
- Client-side filtering/sorting (fast for <1000 rows)
- Pagination reduces DOM nodes
- Efficient re-renders with React Table
