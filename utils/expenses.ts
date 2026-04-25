// Ported from the web app's src/app/utils/expenses.tsx.
// Only includes helpers used so far in the mobile port — add more on demand.

import { Envelope, Expense, Income } from '@/types';

export function getFormattedDate(
  date: string | Date = new Date(),
  format: 'yyyy-MM' | 'yyyy-MM-dd' = 'yyyy-MM-dd'
): string {
  if (typeof date === 'string') return date;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format === 'yyyy-MM' ? `${year}-${month}` : `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function totalSpend(
  envelope: Envelope,
  timeframe: 'weekly' | 'monthly' | 'all' = 'all'
): number {
  if (!envelope.expenses || envelope.expenses.length === 0) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filtered: Expense[] =
    timeframe === 'weekly'
      ? envelope.expenses.filter((expense) => {
          const d = new Date(expense.date);
          d.setHours(0, 0, 0, 0);
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);
          return d >= sevenDaysAgo && d <= today;
        })
      : timeframe === 'monthly'
        ? envelope.expenses.filter((expense) => {
            const d = new Date(expense.date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
          })
        : envelope.expenses;

  return filtered.reduce((sum, expense) => sum + (expense.amount || 0), 0);
}

export function filterCurrentMonthExpenses(
  expenses: Expense[],
  month?: number,
  year?: number
): Expense[] {
  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();

  return expenses.filter((expense) => {
    const [y, m] = expense.date.split('-').map(Number);
    return y === targetYear && m === targetMonth;
  });
}

export function totalSpentOnDate(expenses: Expense[], date: Date | string = new Date()): number {
  const target = getFormattedDate(date);
  return expenses
    .filter((expense) => expense.date === target)
    .reduce((total, expense) => total + expense.amount, 0);
}

export function dailySpendingLastSevenDays(expenses: Expense[]): { date: string; total: number }[] {
  const today = new Date();
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(getFormattedDate(d));
  }
  return days.map((date) => ({
    date,
    total: expenses
      .filter((expense) => expense.date === date)
      .reduce((total, expense) => total + expense.amount, 0),
  }));
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthName(monthNumber: number): string {
  return MONTH_NAMES[monthNumber] ?? 'Invalid month';
}

export interface SummaryDetails {
  incomeTotals: number;
  expenseTotals: number;
  spendingDifference: number;
  spendingComparison: number;
  highestEnvelope: string;
  highestAmount: number;
  frequentEnvelope: string;
  highestSpendingLocation: string;
  highestSpendingAmount: number;
}

export interface IncomeDetails {
  totalSavings: number;
  totalInvestments: number;
}

export function getMonthlyExpenditureDetails(
  incomes: Income[],
  expenses: Expense[]
): SummaryDetails {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonthDate = new Date(now);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const byMonth = <T extends { date: string }>(data: T[], month: number, year: number) =>
    data.filter((item) => {
      const [itemYear, itemMonth] = item.date.split('-').map(Number);
      return itemMonth - 1 === month && itemYear === year;
    });

  const thisMonthExpenses = byMonth(expenses, currentMonth, currentYear);
  const lastMonthExpenses = byMonth(expenses, lastMonth, lastMonthYear);
  const thisMonthIncomes = byMonth(incomes, currentMonth, currentYear);

  const sum = (arr: { amount: number }[]) =>
    arr.reduce((total, item) => total + (item.amount || 0), 0);

  const totalSpendingThisMonth = sum(thisMonthExpenses);
  const totalSpendingLastMonth = sum(lastMonthExpenses);
  const totalIncomeThisMonth = sum(thisMonthIncomes);

  const mostSpent = (by: 'envelopeId' | 'location') =>
    thisMonthExpenses.reduce<Record<string, number>>((acc, expense) => {
      const key = expense[by];
      if (key) acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {});

  const mostSpentEnvelope = mostSpent('envelopeId');
  const mostSpentLocation = mostSpent('location');

  const mostFrequentEnvelope = thisMonthExpenses.reduce<Record<string, number>>((acc, expense) => {
    if (expense.envelopeId) acc[expense.envelopeId] = (acc[expense.envelopeId] || 0) + 1;
    return acc;
  }, {});

  const [highestEnvelope = 'N/A', highestAmount = 0] =
    Object.entries(mostSpentEnvelope).sort((a, b) => b[1] - a[1])[0] ?? [];
  const [frequentEnvelope = 'N/A'] =
    Object.entries(mostFrequentEnvelope).sort((a, b) => b[1] - a[1])[0] ?? [];
  const [highestSpendingLocation = 'N/A', highestSpendingAmount = 0] =
    Object.entries(mostSpentLocation).sort((a, b) => b[1] - a[1])[0] ?? [];

  const spendingComparison =
    totalSpendingLastMonth === 0
      ? 0
      : ((totalSpendingThisMonth - totalSpendingLastMonth) / totalSpendingLastMonth) * 100;

  return {
    incomeTotals: totalIncomeThisMonth,
    expenseTotals: totalSpendingThisMonth,
    spendingDifference: totalIncomeThisMonth - totalSpendingThisMonth,
    spendingComparison,
    highestEnvelope,
    highestAmount,
    frequentEnvelope,
    highestSpendingLocation,
    highestSpendingAmount,
  };
}

export interface YearSummaryDetails {
  incomeTotals: number;
  expenseTotals: number;
  spendingDifference: number;
  highestEnvelope: string;
  highestAmount: number;
  frequentEnvelope: string;
  monthlyExpenses: number[];
  monthlyIncome: number[];
}

export function getYearlyExpenditureDetails(
  incomes: Income[],
  expenses: Expense[],
  year: number
): YearSummaryDetails {
  const filterByYear = <T extends { date: string }>(data: T[]) =>
    data.filter((item) => new Date(item.date).getFullYear() === year);

  const yearlyExpenses = filterByYear(expenses);
  const yearlyIncomes = filterByYear(incomes);

  const sum = (arr: { amount: number }[]) =>
    arr.reduce((total, item) => total + (item.amount || 0), 0);

  const monthlyIncome = new Array(12).fill(0);
  const monthlyExpenses = new Array(12).fill(0);

  for (const income of yearlyIncomes) {
    const d = new Date(income.date);
    monthlyIncome[d.getMonth()] += income.amount;
  }
  for (const expense of yearlyExpenses) {
    const d = new Date(expense.date);
    monthlyExpenses[d.getMonth()] += expense.amount;
  }

  const mostSpentEnvelope = yearlyExpenses.reduce<Record<string, number>>((acc, expense) => {
    if (expense.envelopeId) acc[expense.envelopeId] = (acc[expense.envelopeId] || 0) + expense.amount;
    return acc;
  }, {});
  const mostFrequentEnvelope = yearlyExpenses.reduce<Record<string, number>>((acc, expense) => {
    if (expense.envelopeId) acc[expense.envelopeId] = (acc[expense.envelopeId] || 0) + 1;
    return acc;
  }, {});

  const [highestEnvelope = 'N/A', highestAmount = 0] =
    Object.entries(mostSpentEnvelope).sort((a, b) => b[1] - a[1])[0] ?? [];
  const [frequentEnvelope = 'N/A'] =
    Object.entries(mostFrequentEnvelope).sort((a, b) => b[1] - a[1])[0] ?? [];

  return {
    incomeTotals: sum(yearlyIncomes),
    expenseTotals: sum(yearlyExpenses),
    spendingDifference: sum(yearlyIncomes) - sum(yearlyExpenses),
    highestEnvelope,
    highestAmount,
    frequentEnvelope,
    monthlyExpenses,
    monthlyIncome,
  };
}

export function calculateIncomeAllocations(incomes: Income[], isYear: boolean): IncomeDetails {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const filtered = incomes.filter((income) => {
    const d = new Date(income.date);
    if (isYear) return d.getFullYear() === currentYear;
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  return {
    totalSavings: filtered.reduce((sum, income) => sum + (income.savings ?? 0), 0),
    totalInvestments: filtered.reduce((sum, income) => sum + (income.investments ?? 0), 0),
  };
}
