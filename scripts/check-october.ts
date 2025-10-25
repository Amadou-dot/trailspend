import connectDB from '../lib/db';
import User from '../lib/models/User';
import Transaction from '../lib/models/Transaction';

async function checkOctoberTransactions() {
  await connectDB();
  
  const user = await User.findOne({ email: 'user-demo-123' });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  
  const oct = await Transaction.find({ 
    userId: user._id, 
    date: { $gte: new Date('2025-10-01') } 
  }).sort({ date: -1 }).limit(15).lean();
  
  console.log('October 2025 transactions:');
  console.log('Date       | Merchant             | Amount     | Type     | Category');
  console.log('-----------|----------------------|------------|----------|------------------');
  oct.forEach(t => {
    const date = t.date.toISOString().split('T')[0];
    const merchant = (t.merchantName || t.name || 'Unknown').padEnd(20).substring(0, 20);
    const amount = `$${t.amount}`.padStart(10);
    const type = t.amount > 0 ? 'EXPENSE' : 'INCOME';
    const category = (t.personalFinanceCategory?.primary || 'N/A').substring(0, 18);
    console.log(`${date} | ${merchant} | ${amount} | ${type.padEnd(8)} | ${category}`);
  });
  
  // Using Plaid convention: positive = expense, negative = income
  const expenses = oct.filter(t => t.amount > 0);
  const income = oct.filter(t => t.amount < 0);
  
  console.log(`\nSummary (Plaid convention):`);
  console.log(`Total October transactions: ${oct.length}`);
  console.log(`Expenses (positive amounts): ${expenses.length}`);
  console.log(`Income (negative amounts): ${income.length}`);
  
  process.exit(0);
}

checkOctoberTransactions().catch(console.error);
