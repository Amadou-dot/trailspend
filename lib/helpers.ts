/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Get frequency label
 */
export function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    WEEKLY: 'Weekly',
    BIWEEKLY: 'Bi-weekly',
    SEMI_MONTHLY: 'Semi-monthly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    SEMI_ANNUALLY: 'Semi-annually',
    ANNUALLY: 'Annually',
  };
  return labels[frequency] || frequency;
}

/**
 * Calculate next payment date based on frequency
 */
export function getNextPaymentDate(lastDate: Date | string, frequency: string): Date {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'BIWEEKLY':
      date.setDate(date.getDate() + 14);
      break;
    case 'SEMI_MONTHLY':
      date.setDate(date.getDate() + 15);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'SEMI_ANNUALLY':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'ANNUALLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date;
}

/**
 * Group transactions by merchant
 */
export function groupByMerchant(transactions: unknown[]): Map<string, unknown[]> {
  const grouped = new Map<string, unknown[]>();
  
  transactions.forEach(transaction => {
    const t = transaction as { merchantName?: string; name?: string };
    const merchant = t.merchantName || t.name || 'Unknown';
    if (!grouped.has(merchant)) {
      grouped.set(merchant, []);
    }
    grouped.get(merchant)!.push(transaction);
  });
  
  return grouped;
}

/**
 * Calculate total spending by category
 */
export function calculateCategoryTotals(transactions: unknown[]): Map<string, number> {
  const totals = new Map<string, number>();
  
  transactions.forEach(transaction => {
    const t = transaction as {
      personalFinanceCategory?: { primary?: string };
      category?: string[];
      amount: number;
    };
    const category = t.personalFinanceCategory?.primary || 
                     t.category?.[0] || 
                     'Uncategorized';
    const amount = t.amount;
    
    totals.set(category, (totals.get(category) || 0) + amount);
  });
  
  return totals;
}

/**
 * Get days until next payment
 */
export function getDaysUntil(date: Date | string): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = targetDate.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.getTime() > new Date().getTime();
}
