import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Envelope } from '@/types';
import { getMonthName } from '@/utils/expenses';
import { totalSpend } from '@/utils/expenses';

type FocusedEnvModalProps = {
  isOpen: boolean;
  onClose: () => void;
  envelope: Envelope | null;
  month: number;
};

export function FocusedEnvModal({ isOpen, onClose, envelope, month }: FocusedEnvModalProps) {
  if (!envelope) return null;

  const spent = totalSpend(envelope, 'monthly');
  const remaining = envelope.budget - spent;
  const pctSpent = envelope.budget > 0 ? Math.min(100, (spent / envelope.budget) * 100) : 0;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View className="modal-bg flex-1">
        <View className="modal-main">
          <Pressable
            onPress={onClose}
            className="w-6 h-6 rounded bg-red self-end items-center justify-center">
            <Text className="text-white font-bold">x</Text>
          </Pressable>

          <View
            className="w-full h-2 rounded-full mb-4"
            style={{ backgroundColor: envelope.color }}
          />

          <Text className="header text-2xl font-bold text-grey-400 dark:text-white">
            {envelope.title}
          </Text>
          <Text className="text-center text-grey-300 mb-4">
            {getMonthName(month)} — {envelope.fixed ? 'Fixed' : 'Variable'} budget
          </Text>

          <View className="flex-row justify-between my-2">
            <Text className="text-grey-400 dark:text-white">Budget</Text>
            <Text className="font-semibold text-grey-400 dark:text-white">
              ${envelope.budget.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between my-2">
            <Text className="text-grey-400 dark:text-white">Spent</Text>
            <Text className="font-semibold text-grey-400 dark:text-white">
              ${spent.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between my-2">
            <Text className="text-grey-400 dark:text-white">Remaining</Text>
            <Text
              className={`font-semibold ${remaining < 0 ? 'text-red' : 'text-green-dark'}`}>
              ${remaining.toFixed(2)}
            </Text>
          </View>

          <View className="h-2 bg-grey-100 rounded-full mt-2 mb-4 overflow-hidden">
            <View
              className="h-full"
              style={{
                width: `${pctSpent}%`,
                backgroundColor: pctSpent >= 100 ? '#ad3d3d' : envelope.color,
              }}
            />
          </View>

          <Text className="font-semibold text-grey-400 dark:text-white mt-2">
            This month&apos;s expenses
          </Text>
          <ScrollView className="max-h-60 mt-2">
            {envelope.expenses && envelope.expenses.length > 0 ? (
              envelope.expenses.map((expense) => (
                <View
                  key={expense.id}
                  className="flex-row justify-between border-b border-grey-100 py-2">
                  <View className="flex-1">
                    <Text className="text-grey-400 dark:text-white">{expense.location}</Text>
                    <Text className="text-xs text-grey-300">{expense.date}</Text>
                  </View>
                  <Text className="text-grey-400 dark:text-white">
                    ${expense.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-grey-300 my-2">No expenses yet this month.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
