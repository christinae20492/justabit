import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AddEnvelopeModal } from '@/components/ui/add-envelope-modal';
import { DailySpendingModal } from '@/components/ui/daily-spending-modal';
import { EnvelopePieChart } from '@/components/ui/envelope-pie-chart';
import { FocusedEnvModal } from '@/components/ui/focused-env-modal';
import { Layout } from '@/components/ui/layout';
import { Envelope, Expense } from '@/types';
import {
  dailySpendingLastSevenDays,
  getMonthName,
  totalSpend,
  totalSpentOnDate,
} from '@/utils/expenses';

// TODO: swap for Supabase reads + realtime subscription when backend lands.
const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', location: "Trader Joe's", envelopeId: 'env-groceries', userId: 'u1', date: daysAgo(0), amount: 64, comments: null, dateCreated: new Date(), dateUpdated: new Date() },
  { id: 'e2', location: 'Whole Foods', envelopeId: 'env-groceries', userId: 'u1', date: daysAgo(3), amount: 112, comments: 'weekly shop', dateCreated: new Date(), dateUpdated: new Date() },
  { id: 'e3', location: 'Shell', envelopeId: 'env-transport', userId: 'u1', date: daysAgo(5), amount: 42, comments: null, dateCreated: new Date(), dateUpdated: new Date() },
  { id: 'e4', location: 'Uber', envelopeId: 'env-transport', userId: 'u1', date: daysAgo(8), amount: 18, comments: null, dateCreated: new Date(), dateUpdated: new Date() },
  { id: 'e5', location: 'Cinema', envelopeId: 'env-fun', userId: 'u1', date: daysAgo(4), amount: 28, comments: null, dateCreated: new Date(), dateUpdated: new Date() },
  { id: 'e6', location: 'Restaurant', envelopeId: 'env-fun', userId: 'u1', date: daysAgo(2), amount: 55, comments: null, dateCreated: new Date(), dateUpdated: new Date() },
  { id: 'e7', location: 'Verizon', envelopeId: 'env-bills', userId: 'u1', date: daysAgo(10), amount: 95, comments: null, dateCreated: new Date(), dateUpdated: new Date() },
  { id: 'e8', location: 'Electric Co', envelopeId: 'env-bills', userId: 'u1', date: daysAgo(15), amount: 80, comments: null, dateCreated: new Date(), dateUpdated: new Date() },
];

const MOCK_ENVELOPES: Envelope[] = [
  { id: 'env-groceries', title: 'Groceries', fixed: false, budget: 600, icon: 'cart', userId: 'u1', color: '#86bd75', comments: null, dateCreated: new Date(), dateUpdated: new Date(), expenses: MOCK_EXPENSES.filter((e) => e.envelopeId === 'env-groceries') },
  { id: 'env-transport', title: 'Transport', fixed: true, budget: 300, icon: 'car', userId: 'u1', color: '#52808D', comments: null, dateCreated: new Date(), dateUpdated: new Date(), expenses: MOCK_EXPENSES.filter((e) => e.envelopeId === 'env-transport') },
  { id: 'env-fun', title: 'Fun', fixed: false, budget: 200, icon: 'movie', userId: 'u1', color: '#E3AAB3', comments: null, dateCreated: new Date(), dateUpdated: new Date(), expenses: MOCK_EXPENSES.filter((e) => e.envelopeId === 'env-fun') },
  { id: 'env-bills', title: 'Bills', fixed: true, budget: 400, icon: 'receipt', userId: 'u1', color: '#3A27B7', comments: null, dateCreated: new Date(), dateUpdated: new Date(), expenses: MOCK_EXPENSES.filter((e) => e.envelopeId === 'env-bills') },
];

export default function EnvelopesScreen() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>(MOCK_ENVELOPES);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [focusedEnvelope, setFocusedEnvelope] = useState<Envelope | null>(null);
  const [isFocusedVisible, setFocusedVisible] = useState(false);
  const [isAddVisible, setAddVisible] = useState(false);
  const [isDailyVisible, setDailyVisible] = useState(false);

  const fixedEnvelopes = useMemo(() => envelopes.filter((env) => env.fixed), [envelopes]);
  const variableEnvelopes = useMemo(() => envelopes.filter((env) => !env.fixed), [envelopes]);

  const todaysSpending = useMemo(() => totalSpentOnDate(MOCK_EXPENSES), []);
  const sevenDayBreakdown = useMemo(() => dailySpendingLastSevenDays(MOCK_EXPENSES), []);

  const incrementMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const decrementMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const openEnvelope = (env: Envelope) => {
    setFocusedEnvelope(env);
    setFocusedVisible(true);
  };

  const renderSection = (data: Envelope[], title: string) => (
    <View className="envelope-container my-4">
      <View className="envelope-container-title">
        <Text className="text-grey-400 font-bold text-lg">{title}</Text>
      </View>
      {data.length === 0 ? (
        <View className="mt-4 p-4 border border-dashed border-grey-200 rounded-md items-center">
          <Text className="text-grey-300">Nothing here yet. Try adding a new envelope!</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-center mt-3">
          {data.map((env) => {
            const spent = totalSpend(env, 'monthly');
            return (
              <Pressable
                key={env.id}
                onPress={() => openEnvelope(env)}
                className="envelope p-3"
                style={{ backgroundColor: env.color }}>
                <Text className="envelope-title-text text-white">{env.title}</Text>
                <Text className="envelope-body-text text-white">
                  ${spent.toFixed(2)} spent from ${env.budget.toFixed(2)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <Layout>
      <Text className="text-2xl font-bold text-center text-grey-400 dark:text-white">
        Budget Overview
      </Text>

      <View className="flex-row items-center justify-center mt-2">
        <Pressable onPress={decrementMonth} className="px-3 py-1">
          <MaterialIcons name="chevron-left" size={24} color="#52808D" />
        </Pressable>
        <Text className="text-lg text-grey-400 dark:text-white mx-2">
          {getMonthName(currentMonth)} {currentYear}
        </Text>
        <Pressable onPress={incrementMonth} className="px-3 py-1">
          <MaterialIcons name="chevron-right" size={24} color="#52808D" />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-center my-4">
        <Pressable onPress={() => setDailyVisible(true)} className="mr-2">
          <MaterialIcons name="list-alt" size={22} color="#52808D" />
        </Pressable>
        <Text className="text-grey-400 dark:text-white">
          Total Daily Spending: ${todaysSpending.toFixed(2)}
        </Text>
      </View>

      <ScrollView className="w-11/12 border border-grey-100 self-center mt-2 p-3 rounded-lg">
        <EnvelopePieChart envelopes={envelopes} />

        {renderSection(fixedEnvelopes, 'Fixed')}
        {renderSection(variableEnvelopes, 'Variable')}

        <Pressable
          onPress={() => setAddVisible(true)}
          className="button self-center my-4 items-center">
          <Text className="text-grey-400 font-semibold">Add Envelope</Text>
        </Pressable>
      </ScrollView>

      <AddEnvelopeModal
        isOpen={isAddVisible}
        onClose={() => setAddVisible(false)}
        onCreate={(newEnv) => {
          // TODO: replace this optimistic local push with POST /api/envelopes.
          setEnvelopes((prev) => [
            ...prev,
            {
              id: `env-${Date.now()}`,
              title: newEnv.title,
              fixed: newEnv.fixed,
              budget: newEnv.budget,
              icon: newEnv.icon,
              userId: 'u1',
              color: newEnv.color,
              comments: newEnv.comments,
              dateCreated: new Date(),
              dateUpdated: new Date(),
              expenses: [],
            },
          ]);
        }}
      />
      <FocusedEnvModal
        isOpen={isFocusedVisible}
        onClose={() => setFocusedVisible(false)}
        envelope={focusedEnvelope}
        month={currentMonth}
      />
      <DailySpendingModal
        isOpen={isDailyVisible}
        onClose={() => setDailyVisible(false)}
        data={sevenDayBreakdown}
      />
    </Layout>
  );
}
