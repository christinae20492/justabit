import { Modal, Pressable, Text, View } from 'react-native';

type DailySpendingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: { date: string; total: number }[];
};

export function DailySpendingModal({ isOpen, onClose, data }: DailySpendingModalProps) {
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
            7 Days Record
          </Text>
          <View>
            {data.map((day) => (
              <View key={day.date} className="flex-row justify-between py-2 border-b border-grey-100">
                <Text className="text-grey-400 dark:text-white">{day.date}</Text>
                <Text className="text-grey-400 dark:text-white">${day.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
