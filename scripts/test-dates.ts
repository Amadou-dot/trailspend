// Test date calculations
const testPeriods = () => {
  console.log('Current date:', new Date().toISOString());
  
  // This month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  console.log('Start of this month:', thisMonth.toISOString());
  
  // 30 days ago
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() - 30);
  console.log('30 days ago:', thirtyDays.toISOString());
  
  // Test transactions
  const transactions = [
    { date: new Date('2025-10-15'), amount: -50 },
    { date: new Date('2025-10-01'), amount: -100 },
    { date: new Date('2025-09-25'), amount: -75 },
  ];
  
  const thisMonthTxns = transactions.filter(t => new Date(t.date) >= thisMonth);
  const last30DaysTxns = transactions.filter(t => new Date(t.date) >= thirtyDays);
  
  console.log('This month transactions:', thisMonthTxns.length);
  console.log('Last 30 days transactions:', last30DaysTxns.length);
};

testPeriods();
