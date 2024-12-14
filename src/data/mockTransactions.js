// Helper function to generate random timestamps between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Constants for categories and subcategories
export const CATEGORIES = {
  FOOD: {
    name: 'Food',
    subcategories: ['Groceries', 'Restaurant', 'Snacks', 'Milk', 'Beverages']
  },
  TRANSPORTATION: {
    name: 'Transportation',
    subcategories: ['Train', 'Bus', 'Taxi', 'Fuel', 'Maintenance']
  },
  UTILITIES: {
    name: 'Utilities',
    subcategories: ['Electricity', 'Water', 'Internet', 'Phone', 'Gas']
  },
  ENTERTAINMENT: {
    name: 'Entertainment',
    subcategories: ['Movies', 'Games', 'Books', 'Sports', 'Music']
  },
  SHOPPING: {
    name: 'Shopping',
    subcategories: ['Clothing', 'Electronics', 'Home', 'Gifts']
  }
};

export const PAYMENT_MODES = {
  CASH: 'Cash',
  SAVING_ACCOUNT_1: 'Saving Bank Account 1',
  CREDIT_CARD: 'Credit Card',
  UPI: 'UPI',
  NET_BANKING: 'Net Banking'
};

export const TRANSACTION_TYPES = {
  EXPENSE: 'Expense',
  INCOME: 'Income',
  TRANSFER_OUT: 'Transfer-Out',
  TRANSFER_IN: 'Transfer-In'
};

// Generate mock transactions
export const generateMockTransactions = (count = 100) => {
  const startDate = new Date('2023-01-01');
  const endDate = new Date();
  
  return Array.from({ length: count }, () => {
    const category = Object.values(CATEGORIES)[Math.floor(Math.random() * Object.values(CATEGORIES).length)];
    const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
    const amount = Math.floor(Math.random() * 25000) + 100; // Random amount between 100 and 25100
    const type = Math.random() > 0.2 ? TRANSACTION_TYPES.EXPENSE : TRANSACTION_TYPES.INCOME;

    return {
      id: Math.random().toString(36).substr(2, 9),
      date: randomDate(startDate, endDate),
      timestamp: randomDate(startDate, endDate).getTime(),
      mode: Object.values(PAYMENT_MODES)[Math.floor(Math.random() * Object.values(PAYMENT_MODES).length)],
      category: category.name,
      subcategory: subcategory,
      note: `Transaction for ${category.name} - ${subcategory}`,
      amount: amount,
      type: type,
      currency: 'INR'
    };
  });
};

// Sample usage:
export const mockTransactions = generateMockTransactions(1000);

// Helper function to get transaction statistics
export const getTransactionStats = (transactions) => {
  return {
    totalTransactions: transactions.length,
    totalExpense: transactions
      .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0),
    totalIncome: transactions
      .filter(t => t.type === TRANSACTION_TYPES.INCOME)
      .reduce((sum, t) => sum + t.amount, 0),
    byCategory: Object.fromEntries(
      Object.values(CATEGORIES).map(cat => [
        cat.name,
        transactions.filter(t => t.category === cat.name).length
      ])
    ),
    byPaymentMode: Object.fromEntries(
      Object.values(PAYMENT_MODES).map(mode => [
        mode,
        transactions.filter(t => t.mode === mode).length
      ])
    )
  };
}; 