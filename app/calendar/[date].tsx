import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Layout } from '@/components/ui/layout';
import { Envelope, Expense, Income } from '@/types';
import { getEnvelopes } from '@/utils/db/envelopes';
import { deleteExpense, getExpensesByDate } from '@/utils/db/expenses';
import { deleteIncome, getIncomesByDate } from '@/utils/db/incomes';
import { showToast } from '@/utils/toast';

export default function DayDetailsScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!date) return;
    try {
      const [exp, inc, env] = await Promise.all([
        getExpensesByDate(date),
        getIncomesByDate(date),
        getEnvelopes(),
      ]);
      setExpenses(exp);
      setIncomes(inc);
      setEnvelopes(env);
    } catch (e: any) {
      Alert.alert('Error loading data', e.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const getEnvelopeTitle = (envelopeId: string) =>
    envelopes.find((env) => env.id === envelopeId)?.title ?? 'Unknown';

  const confirmDelete = (label: string, onConfirm: () => void) => {
    Alert.alert(`Delete ${label}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleDeleteExpense = (id: string) => {
    confirmDelete('expense', async () => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      try {
        await deleteExpense(id);
        showToast.success('Expense deleted');
      } catch (e: any) {
        Alert.alert('Delete failed', e.message);
        load();
      }
    });
  };

  const handleDeleteIncome = (id: string) => {
    confirmDelete('income', async () => {
      setIncomes((prev) => prev.filter((i) => i.id !== id));
      try {
        await deleteIncome(id);
        showToast.success('Income deleted');
      } catch (e: any) {
        Alert.alert('Delete failed', e.message);
        load();
      }
    });
  };

  return (
    <Layout>
      <Text className="header text-2xl font-bold text-center text-grey-400 dark:text-white">
        {date}
      </Text>

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <ScrollView className="px-4">
          <Text className="header text-xl font-semibold text-center mt-4 text-grey-400 dark:text-white">
            Expenses
          </Text>

          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <View key={expense.id} className="exp-inc-item my-2">
                <Text className="text-center text-grey-400 dark:text-white">
                  {expense.location} — ${expense.amount.toFixed(2)}
                </Text>
                <Text className="text-center text-sm text-grey-300">
                  {getEnvelopeTitle(expense.envelopeId)}
                </Text>
                {expense.comments ? (
                  <Text className="text-center text-xs text-grey-300 italic mt-1">
                    &quot;{expense.comments}&quot;
                  </Text>
                ) : null}
                <Pressable
                  onPress={() => handleDeleteExpense(expense.id)}
                  className="self-center mt-2 px-3 py-1 rounded bg-red">
                  <Text className="text-white text-sm">Delete</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text className="text-center text-grey-300 my-2">No expenses recorded.</Text>
          )}

          <Pressable
            onPress={() =>
              router.push({ pathname: '/calendar/add-expense', params: { selectedDate: date } })
            }
            className="self-center my-3 px-4 py-2 rounded bg-green-vivid">
            <Text className="text-white font-semibold">Add Expense</Text>
          </Pressable>

          <Text className="header text-xl font-semibold text-center mt-6 text-grey-400 dark:text-white">
            Income
          </Text>

          {incomes.length > 0 ? (
            incomes.map((income) => (
              <View key={income.id} className="exp-inc-item my-2">
                <Text className="text-center text-green-dark dark:text-green">
                  {income.source} — ${income.amount.toFixed(2)}
                </Text>
                <Pressable
                  onPress={() => handleDeleteIncome(income.id)}
                  className="self-center mt-2 px-3 py-1 rounded bg-red">
                  <Text className="text-white text-sm">Delete</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text className="text-center text-grey-300 my-2">No income recorded.</Text>
          )}

          <Pressable
            onPress={() =>
              router.push({ pathname: '/calendar/add-income', params: { selectedDate: date } })
            }
            className="self-center my-3 px-4 py-2 rounded bg-blue-med">
            <Text className="text-white font-semibold">Add Income</Text>
          </Pressable>
        </ScrollView>
      )}
    </Layout>
  );
}
