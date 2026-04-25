import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { AddEnvelopeModal } from '@/components/ui/add-envelope-modal';
import { DailySpendingModal } from '@/components/ui/daily-spending-modal';
import { EnvelopePieChart } from '@/components/ui/envelope-pie-chart';
import { FocusedEnvModal } from '@/components/ui/focused-env-modal';
import { Layout } from '@/components/ui/layout';
import { Envelope, Expense } from '@/types';
import { createEnvelope } from '@/utils/db/envelopes';
import { getEnvelopes } from '@/utils/db/envelopes';
import { getExpenses } from '@/utils/db/expenses';
import { showToast } from '@/utils/toast';
import {
  dailySpendingLastSevenDays,
  getMonthName,
  totalSpend,
  totalSpentOnDate,
} from '@/utils/expenses';

export default function EnvelopesScreen() {
  const today = new Date();
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [focusedEnvelope, setFocusedEnvelope] = useState<Envelope | null>(null);
  const [isFocusedVisible, setFocusedVisible] = useState(false);
  const [isAddVisible, setAddVisible] = useState(false);
  const [isDailyVisible, setDailyVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([getEnvelopes(), getExpenses()])
        .then(([envs, exps]) => {
          if (!active) return;
          setExpenses(exps);
          setEnvelopes(envs);
        })
        .catch((e) => Alert.alert('Error loading data', e.message))
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const envelopesWithExpenses = useMemo<Envelope[]>(
    () => envelopes.map((env) => ({ ...env, expenses: expenses.filter((e) => e.envelopeId === env.id) })),
    [envelopes, expenses]
  );

  const fixedEnvelopes = useMemo(() => envelopesWithExpenses.filter((env) => env.fixed), [envelopesWithExpenses]);
  const variableEnvelopes = useMemo(() => envelopesWithExpenses.filter((env) => !env.fixed), [envelopesWithExpenses]);

  const todaysSpending = useMemo(() => totalSpentOnDate(expenses), [expenses]);
  const sevenDayBreakdown = useMemo(() => dailySpendingLastSevenDays(expenses), [expenses]);

  const incrementMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) { setCurrentYear((y) => y + 1); return 0; }
      return prev + 1;
    });
  };
  const decrementMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) { setCurrentYear((y) => y - 1); return 11; }
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

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <>
          <View className="flex-row items-center justify-center my-4">
            <Pressable onPress={() => setDailyVisible(true)} className="mr-2">
              <MaterialIcons name="list-alt" size={22} color="#52808D" />
            </Pressable>
            <Text className="text-grey-400 dark:text-white">
              Total Daily Spending: ${todaysSpending.toFixed(2)}
            </Text>
          </View>

          <ScrollView className="w-11/12 border border-grey-100 self-center mt-2 p-3 rounded-lg">
            <EnvelopePieChart envelopes={envelopesWithExpenses} />
            {renderSection(fixedEnvelopes, 'Fixed')}
            {renderSection(variableEnvelopes, 'Variable')}
            <Pressable
              onPress={() => setAddVisible(true)}
              className="button self-center my-4 items-center">
              <Text className="text-grey-400 font-semibold">Add Envelope</Text>
            </Pressable>
          </ScrollView>
        </>
      )}

      <AddEnvelopeModal
        isOpen={isAddVisible}
        onClose={() => setAddVisible(false)}
        onCreate={async (newEnv) => {
          setAddVisible(false);
          try {
            const created = await createEnvelope(newEnv);
            setEnvelopes((prev) => [...prev, created]);
            showToast.success('Envelope created');
          } catch (e: any) {
            Alert.alert('Failed to create envelope', e.message);
          }
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
