import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface SummaryData {
  incomeTotals: number;
  expenseTotals: number;
  spendingDifference: number;
}

const SEGMENTS = [
  { key: 'income',    label: 'Income',    color: '#86bd75' },
  { key: 'expenses',  label: 'Expenses',  color: '#DB6A6A' },
  { key: 'remaining', label: 'Remaining', color: '#AFA72B' },
] as const;

export function SummaryDonutChart({ summary }: { summary: SummaryData }) {
  const income    = Math.max(0, summary.incomeTotals);
  const expenses  = Math.max(0, summary.expenseTotals);
  const remaining = Math.max(0, summary.spendingDifference);

  const values = { income, expenses, remaining };

  const slices = SEGMENTS
    .map((s) => ({ ...s, value: values[s.key] }))
    .filter((s) => s.value > 0);

  const isOverBudget = summary.spendingDifference < 0;

  if (slices.length === 0) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="text-grey-300 text-sm">No data for this month yet.</Text>
      </View>
    );
  }

  return (
    <View className="items-center">
      <PieChart
        data={slices.map((s) => ({ value: s.value, color: s.color }))}
        donut
        radius={100}
        innerRadius={56}
        focusOnPress
        centerLabelComponent={() => (
          <View className="items-center">
            <Text
              style={{ color: isOverBudget ? '#DB6A6A' : '#2b4732', fontWeight: '700', fontSize: 15 }}>
              {isOverBudget ? '-' : ''}${Math.abs(summary.spendingDifference).toFixed(0)}
            </Text>
            <Text style={{ color: '#757575', fontSize: 11 }}>
              {isOverBudget ? 'over' : 'left'}
            </Text>
          </View>
        )}
      />

      <View className="flex-row justify-center flex-wrap mt-4 gap-x-4 gap-y-1">
        {SEGMENTS.map((s) => (
          <View key={s.key} className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: s.color }} />
            <Text className="text-xs text-grey-400 dark:text-white">
              {s.label}: ${values[s.key].toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
