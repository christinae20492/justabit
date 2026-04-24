import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Layout } from '@/components/ui/layout';

type Expense = { id: string; amount: number; envelope: string; location: string };
type Income = { id: string; amount: number };

type Summary = {
  incomeTotals: number;
  expenseTotals: number;
  difference: number;
};

type SpendingDetails = {
  highestEnvelope: string;
  highestAmount: number;
  frequentLocation: string;
};

// TODO: wire to real API. Stubbed for now so frontend can be built in isolation.
const MOCK_INCOMES: Income[] = [
  { id: 'i1', amount: 3200 },
  { id: 'i2', amount: 400 },
];
const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', amount: 640, envelope: 'Groceries', location: 'Trader Joe\'s' },
  { id: 'e2', amount: 210, envelope: 'Transport', location: 'Shell' },
  { id: 'e3', amount: 180, envelope: 'Groceries', location: 'Trader Joe\'s' },
];

function computeSummary(incomes: Income[], expenses: Expense[]): Summary & SpendingDetails {
  const incomeTotals = incomes.reduce((sum, i) => sum + i.amount, 0);
  const expenseTotals = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byEnvelope = new Map<string, number>();
  const byLocation = new Map<string, number>();
  for (const e of expenses) {
    byEnvelope.set(e.envelope, (byEnvelope.get(e.envelope) ?? 0) + e.amount);
    byLocation.set(e.location, (byLocation.get(e.location) ?? 0) + 1);
  }
  const [highestEnvelope, highestAmount] = [...byEnvelope.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['n/a', 0];
  const [frequentLocation] = [...byLocation.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['n/a'];

  return {
    incomeTotals,
    expenseTotals,
    difference: incomeTotals - expenseTotals,
    highestEnvelope,
    highestAmount,
    frequentLocation,
  };
}

export default function HomeScreen() {
  const [summary, setSummary] = useState<Summary>({
    incomeTotals: 0,
    expenseTotals: 0,
    difference: 0,
  });
  const [spendingDetails, setSpendingDetails] = useState<SpendingDetails>({
    highestEnvelope: '',
    highestAmount: 0,
    frequentLocation: '',
  });

  useEffect(() => {
    const details = computeSummary(MOCK_INCOMES, MOCK_EXPENSES);
    setSummary({
      incomeTotals: details.incomeTotals,
      expenseTotals: details.expenseTotals,
      difference: details.difference,
    });
    setSpendingDetails({
      highestEnvelope: details.highestEnvelope,
      highestAmount: details.highestAmount,
      frequentLocation: details.frequentLocation,
    });
  }, []);

  const message = (() => {
    if (summary.difference > 0) {
      return `🎉 Wow, you saved a lot of money this month! You still have $${summary.difference.toFixed(2)} left over after paying the month's debts.`;
    }
    if (summary.difference < 0) {
      return `😞 This month wasn't too good budget-wise. It looks like ${spendingDetails.frequentLocation} really got to you—you spent a total of $${spendingDetails.highestAmount.toFixed(2)} there this month.`;
    }
    if (!spendingDetails.frequentLocation && summary.difference === 0) {
      return `Why are you looking here? There's nothing to report. Get to budgeting already!`;
    }
    return '';
  })();

  return (
    <Layout>
      <Text className="header text-3xl font-bold text-grey-400 dark:text-white">
        Your &quot;At a Glance&quot;
      </Text>

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
            ${summary.difference.toFixed(2)}
          </Text>
        </View>
      </View>

      {message ? (
        <View className="m-6">
          <Text className="text-base text-grey-400 dark:text-white">{message}</Text>
        </View>
      ) : null}

      {/* TODO: port SummaryDoughnutChart. Needs a RN chart lib (react-native-gifted-charts / react-native-svg-charts). */}
      <View className="mt-6 h-48 items-center justify-center border border-dashed border-grey-200 rounded-lg mx-4">
        <Text className="text-grey-300">[donut chart placeholder]</Text>
      </View>
    </Layout>
  );
}
