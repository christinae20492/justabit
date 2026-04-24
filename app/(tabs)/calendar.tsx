import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

import { CalendarModal } from '@/components/ui/calendar-modal';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Layout } from '@/components/ui/layout';
import { Envelope, Expense, Income, ViewType } from '@/types';

// TODO: swap mock data for real Supabase reads + realtime subscription.
const MOCK_ENVELOPES: Envelope[] = [
  {
    id: 'env-groceries',
    title: 'Groceries',
    fixed: false,
    budget: 600,
    icon: 'cart',
    userId: 'u1',
    color: '#86bd75',
    comments: null,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
  {
    id: 'env-transport',
    title: 'Transport',
    fixed: true,
    budget: 300,
    icon: 'car',
    userId: 'u1',
    color: '#52808D',
    comments: null,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
  {
    id: 'env-fun',
    title: 'Fun',
    fixed: false,
    budget: 200,
    icon: 'movie',
    userId: 'u1',
    color: '#E3AAB3',
    comments: null,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1',
    location: "Trader Joe's",
    envelopeId: 'env-groceries',
    userId: 'u1',
    date: daysAgo(1),
    amount: 64,
    comments: null,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
  {
    id: 'e2',
    location: 'Shell',
    envelopeId: 'env-transport',
    userId: 'u1',
    date: daysAgo(3),
    amount: 42,
    comments: 'fill-up',
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
  {
    id: 'e3',
    location: 'Cinema',
    envelopeId: 'env-fun',
    userId: 'u1',
    date: daysAgo(5),
    amount: 28,
    comments: null,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
  {
    id: 'e4',
    location: "Trader Joe's",
    envelopeId: 'env-groceries',
    userId: 'u1',
    date: daysAgo(8),
    amount: 91,
    comments: null,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
];

const MOCK_INCOMES: Income[] = [
  {
    id: 'i1',
    source: 'Payroll',
    amount: 3200,
    date: daysAgo(14),
    userId: 'u1',
    savings: 200,
    investments: 200,
    remainder: 2800,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  },
];

const INCOME_COLOR = '#239312';
const FALLBACK_EXPENSE_COLOR = '#DA5151';

export default function ExpenseCalendarScreen() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<ViewType>('both');
  const [selectedDate, setSelectedDate] = useState('');

  const [expenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [incomes] = useState<Income[]>(MOCK_INCOMES);
  const [envelopes] = useState<Envelope[]>(MOCK_ENVELOPES);

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
