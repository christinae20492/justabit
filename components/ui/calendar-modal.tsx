import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Envelope, Expense, Income, ViewType } from '@/types';

type CalendarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  incomes: Income[];
  envelopes: Envelope[];
  selectedDate: string;
  view: ViewType;
};

export function CalendarModal({
  isOpen,
  onClose,
  expenses,
  incomes,
  envelopes,
  selectedDate,
  view,
}: CalendarModalProps) {
  const router = useRouter();

  const navigateTo = (path: '/calendar/add-expense' | '/calendar/add-income') => {
    onClose();
    router.push({ pathname: path, params: { selectedDate } });
  };

  const displayExpenses = view === 'expenses' || view === 'both' ? expenses : [];
  const displayIncomes = view === 'income' || view === 'both' ? incomes : [];
  const hasData = displayExpenses.length > 0 || displayIncomes.length > 0;

  const getEnvelopeTitle = (envelopeId: string): string => {
    return envelopes.find((env) => env.id === envelopeId)?.title ?? 'Unknown Envelope';
  };

  const emptyLabel =
    view === 'expenses' ? 'expenses' : view === 'income' ? 'income' : 'records';

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View className="modal-bg flex-1">
        <View className="modal-main">
          <Pressable
            onPress={onClose}
            className="w-6 h-6 rounded bg-red self-end items-center justify-center">
            <Text className="text-white font-bold">x</Text>
          </Pressable>

          <Text className="header text-xl font-semibold text-grey-400 dark:text-white">
            Summary of {selectedDate}
          </Text>

          {hasData ? (
            <ScrollView className="max-h-80">
              {displayExpenses.map((expense) => (
                <View key={expense.id} className="border-b border-grey-100 pb-2 mb-2">
                  <Text className="text-grey-400 dark:text-white">
                    <Text className="font-bold">{getEnvelopeTitle(expense.envelopeId)}:</Text>{' '}
                    ${expense.amount} at {expense.location}
                  </Text>
                  {expense.comments ? (
                    <Text className="text-sm text-grey-300">&quot;{expense.comments}&quot;</Text>
                  ) : null}
                </View>
              ))}
              {displayIncomes.map((income) => (
                <View key={income.id} className="border-b border-grey-100 pb-2 mb-2">
                  <Text className="text-grey-400 dark:text-white">
                    <Text className="font-bold">Income:</Text> ${income.amount} from{' '}
                    {income.source}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text className="text-grey-400 dark:text-white my-2">
              No {emptyLabel} for this date.
            </Text>
          )}

          <View className="mt-4">
            <Pressable
              onPress={() => navigateTo('/calendar/add-expense')}
              className="w-full bg-green-vivid py-3 rounded mb-2 items-center">
              <Text className="text-white font-semibold">
                Add Expense for {selectedDate}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigateTo('/calendar/add-income')}
              className="w-full bg-blue-med py-3 rounded items-center">
              <Text className="text-white font-semibold">
                Add Income for {selectedDate}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
