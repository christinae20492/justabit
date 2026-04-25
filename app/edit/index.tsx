import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Layout } from '@/components/ui/layout';
import { Envelope, Expense, Income } from '@/types';
import { getEnvelopes } from '@/utils/db/envelopes';
import { getExpenses } from '@/utils/db/expenses';
import { getIncomes } from '@/utils/db/incomes';
import { formatCurrency, getFormattedDate } from '@/utils/expenses';

export default function ManageScreen() {
  const router = useRouter();
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

  const goToItem = (id: string, type: 'expense' | 'income' | 'envelope') =>
    router.push({ pathname: '/edit/[item]', params: { item: id, type } });

  if (loading) {
    return (
      <Layout>
        <ActivityIndicator className="mt-8" />
      </Layout>
    );
  }

  return (
    <Layout>
      <Text className="header text-2xl font-bold text-center text-grey-400 dark:text-white">
        Manage
      </Text>

      <ScrollView className="px-4">
        <Text className="font-bold text-xl mt-4 text-grey-400 dark:text-white">Expenses</Text>
        {expenses.length === 0 && (
          <Text className="text-grey-300 my-2">No expenses yet.</Text>
        )}
        {expenses.map((expense) => (
          <Pressable
            key={expense.id}
            onPress={() => goToItem(expense.id, 'expense')}
            className="p-3 border border-grey-100 rounded shadow mb-2 bg-white dark:bg-gray-800">
            <Text className="text-grey-300">{getFormattedDate(expense.date)}</Text>
            <Text className="text-grey-400 dark:text-white font-semibold">{expense.location}</Text>
            <Text className="text-grey-400 dark:text-white">{formatCurrency(expense.amount)}</Text>
          </Pressable>
        ))}

        <Text className="font-bold text-xl mt-6 text-grey-400 dark:text-white">Incomes</Text>
        {incomes.length === 0 && (
          <Text className="text-grey-300 my-2">No incomes yet.</Text>
        )}
        {incomes.map((income) => (
          <Pressable
            key={income.id}
            onPress={() => goToItem(income.id, 'income')}
            className="p-3 border border-grey-100 rounded shadow mb-2 bg-white dark:bg-gray-800">
            <Text className="text-grey-300">{getFormattedDate(income.date)}</Text>
            <Text className="text-grey-400 dark:text-white font-semibold">{income.source}</Text>
            <Text className="text-grey-400 dark:text-white">{formatCurrency(income.amount)}</Text>
          </Pressable>
        ))}

        <Text className="font-bold text-xl mt-6 text-grey-400 dark:text-white">Envelopes</Text>
        {envelopes.length === 0 && (
          <Text className="text-grey-300 my-2">No envelopes yet.</Text>
        )}
        {envelopes.map((envelope) => (
          <Pressable
            key={envelope.id}
            onPress={() => goToItem(envelope.id, 'envelope')}
            className="p-3 border border-grey-100 rounded shadow mb-2 bg-white dark:bg-gray-800">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: envelope.color }} />
              <Text className="text-grey-400 dark:text-white font-semibold">{envelope.title}</Text>
            </View>
            <Text className="text-grey-400 dark:text-white">Budget: {formatCurrency(envelope.budget)}</Text>
            <Text className="text-grey-400 dark:text-white">Type: {envelope.fixed ? 'Fixed' : 'Variable'}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Layout>
  );
}
