import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { DateField } from '@/components/ui/date-field';
import { EnvelopePicker } from '@/components/ui/envelope-picker';
import { Layout } from '@/components/ui/layout';
import { Envelope } from '@/types';
import { getEnvelopes } from '@/utils/db/envelopes';
import { createExpense } from '@/utils/db/expenses';
import { showToast } from '@/utils/toast';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function AddExpenseScreen() {
  const router = useRouter();
  const { selectedDate } = useLocalSearchParams<{ selectedDate?: string }>();

  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loadingEnvelopes, setLoadingEnvelopes] = useState(true);
  const [location, setLocation] = useState('');
  const [envelopeId, setEnvelopeId] = useState('');
  const [date, setDate] = useState(selectedDate ?? todayISO());
  const [amount, setAmount] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEnvelopes()
      .then((data) => {
        setEnvelopes(data);
        if (data.length > 0) setEnvelopeId(data[0].id);
      })
      .catch((e) => Alert.alert('Error loading envelopes', e.message))
      .finally(() => setLoadingEnvelopes(false));
  }, []);

  const handleSubmit = async () => {
    if (!location || !envelopeId || !date || !amount) {
      Alert.alert('Please fill in all required fields.');
      return;
    }
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Amount must be a positive number.');
      return;
    }
    setSubmitting(true);
    try {
      await createExpense({
        location,
        envelopeId,
        date,
        amount: parsedAmount,
        comments: comments.trim() || null,
      });
      showToast.success('Expense added');
      router.back();
    } catch (e: any) {
      Alert.alert('Failed to save expense', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <ScrollView>
        <View className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Text className="header text-xl font-semibold text-center text-grey-400 dark:text-white">
            Add New Expense
          </Text>

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
            Location of Purchase <Text className="text-red">*</Text>
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Trader Joe's"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white"
          />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
            Category of Purchase <Text className="text-red">*</Text>
          </Text>
          {loadingEnvelopes ? (
            <ActivityIndicator className="my-2" />
          ) : (
            <EnvelopePicker envelopes={envelopes} value={envelopeId} onChange={setEnvelopeId} />
          )}

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
            Date of Purchase <Text className="text-red">*</Text>
          </Text>
          <DateField value={date} onChange={setDate} />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
            Total Cost ($) <Text className="text-red">*</Text>
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white"
          />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">Comments</Text>
          <TextInput
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Optional notes"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white min-h-16"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={submitting || loadingEnvelopes}
            className="self-center mt-6 px-6 py-2 rounded-md bg-blue-light">
            <Text className="text-white font-semibold">
              {submitting ? 'Saving…' : 'Add Expense'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  );
}
