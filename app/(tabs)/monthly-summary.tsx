import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import { Layout } from '@/components/ui/layout';
import { Envelope, Expense, Income } from '@/types';
import { getEnvelopes } from '@/utils/db/envelopes';
import { getExpenses } from '@/utils/db/expenses';
import { getIncomes } from '@/utils/db/incomes';
import {
  calculateIncomeAllocations,
  filterCurrentMonthExpenses,
  getMonthlyExpenditureDetails,
  totalSpend,
} from '@/utils/expenses';

export default function MonthlySummaryScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([getExpenses(), getIncomes(), getEnvelopes()])
        .then(([exp, inc, env]) => {
          if (!active) return;
          setExpenses(exp);
          setIncomes(inc);
          setEnvelopes(env);
        })
        .catch((e) => Alert.alert('Error loading data', e.message))
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const summary = useMemo(() => getMonthlyExpenditureDetails(incomes, expenses), [incomes, expenses]);
  const incDetails = useMemo(() => calculateIncomeAllocations(incomes, false), [incomes]);

  const thisMonthsEnvelopes = useMemo<Envelope[]>(() => {
    const thisMonthExpenses = filterCurrentMonthExpenses(expenses);
    return envelopes.map((env) => ({
      ...env,
      expenses: thisMonthExpenses.filter((e) => e.envelopeId === env.id),
    }));
  }, [envelopes, expenses]);

  const envTitle = (envId: string) =>
    thisMonthsEnvelopes.find((e) => e.id === envId)?.title ?? 'Unknown Envelope';

  return (
    <Layout>
      <Text className="text-2xl font-bold text-center text-grey-400 dark:text-white">
        Monthly Summary
      </Text>

      <Link href="/monthly-summary/year-review" asChild>
        <Text className="text-right p-3 text-green-dark dark:text-green">View the Year →</Text>
      </Link>

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <ScrollView className="px-2">
          <View className="my-2">
            <Text className="text-grey-400 dark:text-white my-1">
              Total Income: ${summary.incomeTotals.toFixed(2)}
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Total Spending: ${summary.expenseTotals.toFixed(2)}
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Net Savings: ${summary.spendingDifference.toFixed(2)}
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Savings: ${incDetails.totalSavings.toFixed(2)}
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Investments: ${incDetails.totalInvestments.toFixed(2)}
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Spending vs. Last Month: {summary.spendingComparison.toFixed(1)}%
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Highest Spending Category: {envTitle(summary.highestEnvelope)} — ${summary.highestAmount.toFixed(2)}
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Most Frequent Category: {envTitle(summary.frequentEnvelope)}
            </Text>
            <Text className="text-grey-400 dark:text-white my-1">
              Highest Spending Location: {summary.highestSpendingLocation} — ${summary.highestSpendingAmount.toFixed(2)}
            </Text>
          </View>

          <Text className="text-center text-xl font-bold mt-6 mb-2 text-grey-400 dark:text-white">
            Envelope Budgets
          </Text>

          {thisMonthsEnvelopes.map((env) => {
            const spent = totalSpend(env, 'monthly');
            const isOverBudget = env.fixed && spent > env.budget;
            return (
              <View key={env.id} className="summary-envelope">
                <Text
                  className={`font-semibold ${isOverBudget ? 'text-red' : 'text-grey-400 dark:text-white'}`}>
                  {env.title}: ${spent.toFixed(2)} / ${env.budget}
                </Text>
                <View className="pl-4 mt-2">
                  {env.expenses && env.expenses.length > 0 ? (
                    env.expenses.map((expense) => (
                      <Text key={expense.id} className="text-sm text-grey-300 dark:text-grey-100 my-0.5">
                        {expense.location}: ${expense.amount.toFixed(2)}
                      </Text>
                    ))
                  ) : (
                    <Text className="text-sm text-grey-300 my-0.5">No expenses this month.</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </Layout>
  );
}
