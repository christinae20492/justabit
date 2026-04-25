import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

import { CalendarModal } from '@/components/ui/calendar-modal';
import { Layout } from '@/components/ui/layout';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Envelope, Expense, Income, ViewType } from '@/types';
import { getEnvelopes } from '@/utils/db/envelopes';
import { getExpenses } from '@/utils/db/expenses';
import { getIncomes } from '@/utils/db/incomes';

const INCOME_COLOR = '#239312';
const FALLBACK_EXPENSE_COLOR = '#DA5151';

export default function ExpenseCalendarScreen() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<ViewType>('both');
  const [selectedDate, setSelectedDate] = useState('');

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getExpenses(), getIncomes(), getEnvelopes()])
        .then(([exp, inc, env]) => {
          if (!active) return;
          setExpenses(exp);
          setIncomes(inc);
          setEnvelopes(env);
        })
        .catch((e) => Alert.alert('Error loading data', e.message));
      return () => { active = false; };
    }, [])
  );

  const getEnvelopeColor = (envelopeId: string) =>
    envelopes.find((env) => env.id === envelopeId)?.color ?? FALLBACK_EXPENSE_COLOR;

  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: { key: string; color: string }[] }> = {};
    const addDot = (date: string, key: string, color: string) => {
      if (!marks[date]) marks[date] = { dots: [] };
      marks[date].dots.push({ key, color });
    };
    if (view === 'expenses' || view === 'both') {
      for (const expense of expenses) {
        addDot(expense.date, `exp-${expense.id}`, getEnvelopeColor(expense.envelopeId));
      }
    }
    if (view === 'income' || view === 'both') {
      for (const income of incomes) {
        addDot(income.date, `inc-${income.id}`, INCOME_COLOR);
      }
    }
    return marks;
  }, [view, expenses, incomes, envelopes]);

  const selectedDateExpenses = useMemo(
    () => expenses.filter((e) => e.date === selectedDate),
    [expenses, selectedDate]
  );
  const selectedDateIncomes = useMemo(
    () => incomes.filter((i) => i.date === selectedDate),
    [incomes, selectedDate]
  );

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setIsModalOpen(true);
  };

  const goToDayPage = () => {
    if (!selectedDate) return;
    setIsModalOpen(false);
    router.push({ pathname: '/calendar/[date]', params: { date: selectedDate } });
  };

  return (
    <Layout scroll={false}>
      <View className="my-4">
        <ToggleSwitch value={view} onToggle={setView} />
      </View>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        enableSwipeMonths
        theme={{
          selectedDayBackgroundColor: '#52808D',
          todayTextColor: '#ad3d3d',
          arrowColor: '#52808D',
          dotColor: '#52808D',
        }}
      />

      {selectedDate ? (
        <Pressable
          onPress={goToDayPage}
          className="mt-4 self-center px-4 py-2 bg-blue-med rounded-lg">
          <Text className="text-white">View full day: {selectedDate}</Text>
        </Pressable>
      ) : null}

      <CalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expenses={selectedDateExpenses}
        incomes={selectedDateIncomes}
        envelopes={envelopes}
        selectedDate={selectedDate}
        view={view}
      />
    </Layout>
  );
}
