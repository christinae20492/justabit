import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { Layout } from '@/components/ui/layout';
import { Envelope, Expense, Income } from '@/types';
import { getEnvelopes } from '@/utils/db/envelopes';
import { supabase } from '@/utils/supabase';
import {
  calculateIncomeAllocations,
  getYearlyExpenditureDetails,
} from '@/utils/expenses';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function YearReviewScreen() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    Promise.all([
      supabase.from('expenses').select('*').gte('date', start).lte('date', end),
      supabase.from('incomes').select('*').gte('date', start).lte('date', end),
      getEnvelopes(),
    ])
      .then(([expRes, incRes, envs]) => {
        if (!active) return;
        if (expRes.error) throw expRes.error;
        if (incRes.error) throw incRes.error;
        setExpenses(
          expRes.data.map((r: any) => ({
            id: r.id, location: r.location, envelopeId: r.envelope_id,
            userId: r.user_id, date: r.date, amount: r.amount,
            comments: r.comments ?? null,
            dateCreated: new Date(r.date_created), dateUpdated: new Date(r.date_updated),
          }))
        );
        setIncomes(
          incRes.data.map((r: any) => ({
            id: r.id, source: r.source, amount: r.amount, date: r.date,
            userId: r.user_id, savings: r.savings ?? null,
            investments: r.investments ?? null, remainder: r.remainder ?? null,
            dateCreated: new Date(r.date_created), dateUpdated: new Date(r.date_updated),
          }))
        );
        setEnvelopes(envs);
      })
      .catch((e) => Alert.alert('Error loading data', e.message))
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [year]);

  const summary = getYearlyExpenditureDetails(incomes, expenses, year);
  const incDetails = calculateIncomeAllocations(incomes, true);

  const envTitle = (envId: string) =>
    envelopes.find((e) => e.id === envId)?.title ?? 'n/a';

  const incomeLineData = summary.monthlyIncome.map((value, i) => ({ value, label: MONTH_LABELS[i] }));
  const expenseLineData = summary.monthlyExpenses.map((value) => ({ value }));

  return (
    <Layout>
      <Text className="text-center text-2xl font-bold text-grey-400 dark:text-white">
        Yearly Summary
      </Text>

      <View className="items-center my-5">
        <Pressable onPress={() => setYear((y) => y - 1)}>
          <Text className="text-grey-300 text-lg">Previous Year</Text>
        </Pressable>
        <Text className="text-xl font-bold my-2 text-grey-400 dark:text-white">{year}</Text>
        <Pressable onPress={() => setYear((y) => y + 1)}>
          <Text className="text-grey-300 text-lg">Next Year</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <ScrollView className="px-3">
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
            Highest Spending Category: {envTitle(summary.highestEnvelope)} — ${summary.highestAmount.toFixed(2)}
          </Text>
          <Text className="text-grey-400 dark:text-white my-1">
            Most Frequent Category: {envTitle(summary.frequentEnvelope)}
          </Text>

          <Text className="text-center text-xl font-semibold mt-8 mb-2 text-grey-400 dark:text-white">
            Income vs. Expenditure
          </Text>
          <View className="items-center pr-4">
            <LineChart
              data={incomeLineData}
              data2={expenseLineData}
              color1="#34853B"
              color2="#731718"
              dataPointsColor1="#2CE83F"
              dataPointsColor2="#CC3838"
              width={300}
              height={200}
              initialSpacing={10}
              spacing={30}
              yAxisTextStyle={{ color: '#757575' }}
              xAxisLabelTextStyle={{ color: '#757575', fontSize: 10 }}
              hideRules
            />
            <View className="flex-row justify-center mt-3">
              <View className="flex-row items-center mx-2">
                <View className="w-3 h-3 rounded-sm bg-[#34853B] mr-1" />
                <Text className="text-grey-400 dark:text-white text-sm">Income</Text>
              </View>
              <View className="flex-row items-center mx-2">
                <View className="w-3 h-3 rounded-sm bg-[#731718] mr-1" />
                <Text className="text-grey-400 dark:text-white text-sm">Spending</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Layout>
  );
}
