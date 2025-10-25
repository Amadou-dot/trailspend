import connectDB from '../lib/db';
import User from '../lib/models/User';
import Transaction from '../lib/models/Transaction';
import RecurringSubscription from '../lib/models/RecurringSubscription';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function inspectData() {
  await connectDB();

  console.log('=== USERS ===');
  const users = await User.find({}).lean();
  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`- Email: ${u.email}, ID: ${u._id}, Linked: ${u.accountsLinked}`);
  });

  console.log('\n=== TRANSACTIONS ===');
  const user = users[0];
  if (user) {
    const allTxns = await Transaction.find({ userId: user._id }).lean();
    console.log(`Total transactions: ${allTxns.length}`);
    
    // Get date range
    const dates = allTxns.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    console.log(`Date range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`);
    
    // Count by amount type
    const expenses = allTxns.filter(t => t.amount < 0);
    const income = allTxns.filter(t => t.amount >= 0);
    console.log(`Expenses: ${expenses.length}, Income: ${income.length}`);
    
    // Show sample transactions
    console.log('\nSample transactions (first 5):');
    allTxns.slice(0, 5).forEach(t => {
      console.log(`  - ${t.date.toISOString().split('T')[0]} | ${t.merchantName || t.name} | $${t.amount} | ${t.personalFinanceCategory?.primary || 'Unknown'}`);
    });
    
    // Check 30-day transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTxns = allTxns.filter(t => new Date(t.date) >= thirtyDaysAgo && t.amount < 0);
    console.log(`\nTransactions in last 30 days (expenses only): ${recentTxns.length}`);
    console.log(`30 days ago: ${thirtyDaysAgo.toLocaleDateString()}`);
    console.log(`Today: ${new Date().toLocaleDateString()}`);
    
    console.log('\nExpenses in last 30 days:');
    recentTxns.forEach(t => {
      console.log(`  - ${t.date.toISOString().split('T')[0]} | ${t.merchantName || t.name} | $${t.amount}`);
    });
    
    // Check all October expenses
    const octoberStart = new Date('2025-10-01');
    const octoberTxns = allTxns.filter(t => new Date(t.date) >= octoberStart && t.amount < 0);
    console.log(`\nOctober expenses (from Oct 1): ${octoberTxns.length}`);
    octoberTxns.forEach(t => {
      console.log(`  - ${t.date.toISOString().split('T')[0]} | ${t.merchantName || t.name} | $${t.amount}`);
    });
  }

  console.log('\n=== RECURRING SUBSCRIPTIONS ===');
  if (user) {
    const subs = await RecurringSubscription.find({ userId: user._id }).lean();
    console.log(`Total subscriptions: ${subs.length}`);
    
    subs.forEach(s => {
      console.log(`  - ${s.merchantName} | $${s.lastAmount} | ${s.frequency} | ${s.flowType} | Status: ${s.status} | Active: ${s.isActive}`);
    });
    
    const activeSubs = subs.filter(s => s.status === 'ACTIVE');
    console.log(`\nActive subscriptions: ${activeSubs.length}`);
    
    const outflowSubs = subs.filter(s => s.flowType === 'OUTFLOW');
    console.log(`Outflow subscriptions: ${outflowSubs.length}`);
  }

  process.exit(0);
}

inspectData().catch(console.error);
