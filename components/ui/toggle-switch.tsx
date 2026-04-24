import { Pressable, Text, View } from 'react-native';

import { ViewType } from '@/types';

type ToggleSwitchProps = {
  value: ViewType;
  onToggle: (view: ViewType) => void;
};

const OPTIONS: { label: string; value: ViewType }[] = [
  { label: 'Income', value: 'income' },
  { label: 'Expenses', value: 'expenses' },
  { label: 'Both', value: 'both' },
];

export function ToggleSwitch({ value, onToggle }: ToggleSwitchProps) {
  return (
    <View className="flex-row items-center justify-center bg-blue-med rounded-lg shadow-sm h-14">
      {OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onToggle(option.value)}
          className="px-5 py-2">
          <Text
            className={`text-white text-base ${value === option.value ? 'font-bold' : ''}`}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
