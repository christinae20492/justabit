import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { Layout } from '@/components/ui/layout';
import { SummaryDonutChart } from '@/components/ui/summary-donut-chart';
import { Envelope, Expense, Income } from '@/types';
import { getEnvelopes } from '@/utils/db/envelopes';
import { getExpenses } from '@/utils/db/expenses';
import { getIncomes } from '@/utils/db/incomes';
import { getMonthlyExpenditureDetails } from '@/utils/expenses';

export default function HomeScreen() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([getEnvelopes(), getExpenses(), getIncomes()])
        .then(([envs, exp, inc]) => {
          if (!active) return;
          setEnvelopes(envs);
          setExpenses(exp);
          setIncomes(inc);
        })
        .catch((e) => Alert.alert('Error loading data', e.message))
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const summary = getMonthlyExpenditureDetails(incomes, expenses);

  const envelopeTitle = useMemo(
    () => envelopes.find((e) => e.id === summary.highestEnvelope)?.title ?? null,
    [envelopes, summary.highestEnvelope]
  );

  const message = (() => {
    const hasData = summary.incomeTotals > 0 || summary.expenseTotals > 0;
    if (!hasData) {
      return "Why are you looking here? There's nothing to report. Get to budgeting already!";
    }
    if (summary.spendingDifference > 0) {
      return `Wow, you saved a lot of money this month! You still have $${summary.spendingDifference.toFixed(2)} left over after paying the month's debts.`;
    }
    if (summary.spendingDifference < 0) {
      const locationPart = summary.highestSpendingLocation !== 'N/A'
        ? `It looks like ${summary.highestSpendingLocation} really got to you — you spent $${summary.highestSpendingAmount.toFixed(2)} there.`
        : '';
      const envelopePart = envelopeTitle
        ? ` Your biggest spending category was ${envelopeTitle}.`
        : '';
      return `This month wasn't too good budget-wise. ${locationPart}${envelopePart}`.trim();
    }
    return '';
  })();

  return (
    <Layout>
      <Text className="header text-3xl font-bold text-grey-400 dark:text-white">
        Your &quot;At a Glance&quot;
      </Text>

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <>
          <View className="comparison-table overflow-hidden mx-auto">
            <View className="flex-row">
              <Text className="positive-item flex-1 text-center py-2 font-semibold">Income</Text>
              <Text className="neg-item flex-1 text-center py-2 font-semibold">Expenditure</Text>
              <Text className="difference flex-1 text-center py-2 font-semibold">Difference</Text>
            </View>
            <View className="flex-row">
              <Text className="flex-1 text-center py-2 text-grey-400 dark:text-white">
                ${summary.incomeTotals.toFixed(2)}
              </Text>
              <Text className="flex-1 text-center py-2 text-grey-400 dark:text-white">
                ${summary.expenseTotals.toFixed(2)}
              </Text>
              <Text className="flex-1 text-center py-2 text-grey-400 dark:text-white">
                ${summary.spendingDifference.toFixed(2)}
              </Text>
            </View>
          </View>

          {message ? (
            <View className="m-6">
              <Text className="text-base text-grey-400 dark:text-white">{message}</Text>
            </View>
          ) : null}

          <View className="mt-4 mx-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-grey-100 dark:border-grey-600">
            <Text className="text-base font-semibold text-grey-400 dark:text-white mb-3 text-center">
              This Month's Budget Overview
            </Text>
            <SummaryDonutChart summary={summary} />
          </View>
        </>
      )}
    </Layout>
  );
}
