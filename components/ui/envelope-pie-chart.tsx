import { Text, View } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';

import { Envelope } from '@/types';
import { totalSpend } from '@/utils/expenses';

type EnvelopePieChartProps = {
  envelopes: Envelope[];
};

export function EnvelopePieChart({ envelopes }: EnvelopePieChartProps) {
  const slices = envelopes
    .map((env) => ({
      title: env.title,
      value: totalSpend(env, 'monthly'),
      color: env.color,
    }))
    .filter((s) => s.value > 0);

  if (slices.length === 0) {
    return (
      <View className="items-center justify-center p-6">
        <Text className="text-grey-300">No spending yet this month.</Text>
      </View>
    );
  }

  return (
    <View className="items-center">
      <GiftedPieChart
        data={slices.map((s) => ({ value: s.value, color: s.color }))}
        donut
        radius={110}
        innerRadius={60}
        focusOnPress
      />
      <View className="mt-4 w-full">
        {slices.map((s) => (
          <View key={s.title} className="flex-row items-center my-1">
            <View
              className="w-3 h-3 rounded-sm mr-2"
              style={{ backgroundColor: s.color }}
            />
            <Text className="flex-1 text-grey-400 dark:text-white">{s.title}</Text>
            <Text className="text-grey-400 dark:text-white">${s.value.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
