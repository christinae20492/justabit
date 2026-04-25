import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { DateField } from '@/components/ui/date-field';
import { Layout } from '@/components/ui/layout';
import { createIncome } from '@/utils/db/incomes';
import { showToast } from '@/utils/toast';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function AddIncomeScreen() {
  const router = useRouter();
  const { selectedDate } = useLocalSearchParams<{ selectedDate?: string }>();

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(selectedDate ?? todayISO());
  const [savings, setSavings] = useState('');
  const [investments, setInvestments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const remainder = useMemo(() => {
    const a = Number(amount) || 0;
    const s = Number(savings) || 0;
    const i = Number(investments) || 0;
    return a - s - i;
  }, [amount, savings, investments]);

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!source || !date || !parsedAmount || parsedAmount <= 0) {
      Alert.alert('Please fill in all required fields.');
      return;
    }
    if (remainder < 0) {
      Alert.alert('Total deductions cannot exceed the total income.');
      return;
    }
    setSubmitting(true);
    try {
      await createIncome({
        source,
        amount: parsedAmount,
        date,
        savings: Number(savings) || null,
        investments: Number(investments) || null,
        remainder,
      });
      showToast.success('Income added');
      router.back();
    } catch (e: any) {
      Alert.alert('Failed to save income', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <ScrollView>
        <View className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Text className="header text-xl font-semibold text-center text-grey-400 dark:text-white">
            Add Income
          </Text>

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
            Source of Income <Text className="text-red">*</Text>
          </Text>
          <TextInput
            value={source}
            onChangeText={setSource}
            placeholder="Payroll"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white"
          />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
            Date <Text className="text-red">*</Text>
          </Text>
          <DateField value={date} onChange={setDate} />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
            Total Income Amount ($) <Text className="text-red">*</Text>
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white"
          />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">Savings</Text>
          <TextInput
            value={savings}
            onChangeText={setSavings}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white"
          />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">Investments</Text>
          <TextInput
            value={investments}
            onChangeText={setInvestments}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white"
          />

          <Text className="font-semibold mt-4 text-grey-400 dark:text-white">
            Remaining Income: ${remainder.toFixed(2)}
          </Text>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className="self-center mt-6 px-6 py-2 rounded-md bg-blue-light">
            <Text className="text-white font-semibold">
              {submitting ? 'Saving…' : 'Add Income'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  );
}
