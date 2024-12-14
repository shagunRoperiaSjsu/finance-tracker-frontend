import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';

// Define TRANSACTION_TYPES if not imported from another file
export const TRANSACTION_TYPES = {
    EXPENSE: 'Expense',
    INCOME: 'Income',
};

export const processTransactionData = (data) => {
    if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        return [];
    }
    return data.map(item => {
        if (!item.Date || !item.Amount) {
            console.error("Missing data in item:", item);
            return null;
        }
        return {
            date: new Date(item.Date),
            mode: item.Mode || '',
            category: item.Category || '',
            subcategory: item.Subcategory || '',
            note: item.Note || '',
            amount: parseFloat(item.Amount) || 0, // Ensure Amount is parsed as a float
            type: item.Type || '',
            currency: item.Currency || 'INR',
        };
    }).filter(item => item !== null);
};

export const processTransactionDataForDisplay = (transactions) => {
  // Basic stats
  const totalExpense = transactions
    .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === TRANSACTION_TYPES.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  // Category-wise expenses
  const expensesByCategory = transactions
    .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // Daily transactions for the current month
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const dailyData = eachDayOfInterval({ start: monthStart, end: monthEnd })
    .map(date => {
      const dayTransactions = transactions.filter(t => 
        format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'MMM dd'),
        expense: dayTransactions
          .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0),
        income: dayTransactions
          .filter(t => t.type === TRANSACTION_TYPES.INCOME)
          .reduce((sum, t) => sum + t.amount, 0),
      };
    });

  // Payment mode distribution
  const paymentModeDistribution = transactions
    .reduce((acc, t) => {
      acc[t.mode] = (acc[t.mode] || 0) + 1;
      return acc;
    }, {});

  return {
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense,
    expensesByCategory,
    dailyData,
    paymentModeDistribution,
  };
}; 