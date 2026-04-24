// Ported from the web app's src/app/utils/expenses.tsx.
// Only includes helpers used so far in the mobile port — add more on demand.

import { Envelope, Expense } from '@/types';

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
