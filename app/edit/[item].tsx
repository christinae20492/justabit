import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

import { DateField } from '@/components/ui/date-field';
import { EnvelopePicker } from '@/components/ui/envelope-picker';
import { Layout } from '@/components/ui/layout';
import { Envelope, Expense, Income } from '@/types';
import { deleteEnvelope, getEnvelopes, updateEnvelope } from '@/utils/db/envelopes';
import { deleteExpense, updateExpense } from '@/utils/db/expenses';
import { deleteIncome, updateIncome } from '@/utils/db/incomes';
import { supabase } from '@/utils/supabase';
import { showToast } from '@/utils/toast';

const PALETTE = ['#86bd75', '#52808D', '#E3AAB3', '#B22222', '#AFA72B', '#3A27B7', '#32EE90', '#7596A5'];

type ItemType = 'expense' | 'income' | 'envelope';

export default function EditItemScreen() {
  const router = useRouter();
  const { item, type } = useLocalSearchParams<{ item: string; type: ItemType }>();

  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState<
    | { kind: 'expense'; value: Expense; envelopes: Envelope[] }
    | { kind: 'income'; value: Income }
    | { kind: 'envelope'; value: Envelope }
    | { kind: 'not-found' }
  >({ kind: 'not-found' });

  useEffect(() => {
    if (!item || !type) { setLoading(false); return; }

    const load = async () => {
      try {
        if (type === 'expense') {
          const [{ data, error }, envs] = await Promise.all([
            supabase.from('expenses').select('*').eq('id', item).single(),
            getEnvelopes(),
          ]);
          if (error || !data) { setResolved({ kind: 'not-found' }); return; }
          const exp: Expense = {
            id: data.id, location: data.location, envelopeId: data.envelope_id,
            userId: data.user_id, date: data.date, amount: data.amount,
            comments: data.comments ?? null,
            dateCreated: new Date(data.date_created), dateUpdated: new Date(data.date_updated),
          };
          setResolved({ kind: 'expense', value: exp, envelopes: envs });
        } else if (type === 'income') {
          const { data, error } = await supabase.from('incomes').select('*').eq('id', item).single();
          if (error || !data) { setResolved({ kind: 'not-found' }); return; }
          const inc: Income = {
            id: data.id, source: data.source, amount: data.amount, date: data.date,
            userId: data.user_id, savings: data.savings ?? null,
            investments: data.investments ?? null, remainder: data.remainder ?? null,
            dateCreated: new Date(data.date_created), dateUpdated: new Date(data.date_updated),
          };
          setResolved({ kind: 'income', value: inc });
        } else {
          const { data, error } = await supabase.from('envelopes').select('*').eq('id', item).single();
          if (error || !data) { setResolved({ kind: 'not-found' }); return; }
          const env: Envelope = {
            id: data.id, title: data.title, fixed: data.fixed, budget: data.budget,
            icon: data.icon, color: data.color, comments: data.comments ?? null,
            userId: data.user_id,
            dateCreated: new Date(data.date_created), dateUpdated: new Date(data.date_updated),
          };
          setResolved({ kind: 'envelope', value: env });
        }
      } catch (e: any) {
        Alert.alert('Error loading item', e.message);
        setResolved({ kind: 'not-found' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [item, type]);

  if (loading) return <Layout><ActivityIndicator className="mt-8" /></Layout>;

  if (resolved.kind === 'not-found') {
    return (
      <Layout>
        <View className="flex-1 items-center justify-center">
          <Text className="text-grey-400 dark:text-white text-lg">Item not found.</Text>
          <Pressable onPress={() => router.back()} className="mt-4 px-4 py-2 bg-blue-med rounded">
            <Text className="text-white">Back</Text>
          </Pressable>
        </View>
      </Layout>
    );
  }

  if (resolved.kind === 'expense') {
    return <ExpenseEdit expense={resolved.value} envelopes={resolved.envelopes} />;
  }
  if (resolved.kind === 'income') return <IncomeEdit income={resolved.value} />;
  return <EnvelopeEdit envelope={resolved.value} />;
}

function ExpenseEdit({ expense, envelopes }: { expense: Expense; envelopes: Envelope[] }) {
  const router = useRouter();
  const [location, setLocation] = useState(expense.location);
  const [envelopeId, setEnvelopeId] = useState(expense.envelopeId);
  const [date, setDate] = useState(expense.date);
  const [amount, setAmount] = useState(String(expense.amount));
  const [comments, setComments] = useState(expense.comments ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = Number(amount);
    if (!location || !envelopeId || !date || isNaN(parsed)) {
      Alert.alert('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      await updateExpense(expense.id, {
        location, envelopeId, date, amount: parsed,
        comments: comments.trim() || null,
      });
      showToast.success('Expense saved');
      router.back();
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete this expense?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteExpense(expense.id); showToast.success('Expense deleted'); router.back(); }
          catch (e: any) { Alert.alert('Delete failed', e.message); }
        },
      },
    ]);
  };

  return (
    <Layout>
      <ScrollView className="p-4">
        <Text className="header text-xl font-semibold text-center text-grey-400 dark:text-white">Edit Expense</Text>

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Location</Text>
        <TextInput value={location} onChangeText={setLocation} className="text-input text-grey-400 dark:text-white" />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Envelope</Text>
        <EnvelopePicker envelopes={envelopes} value={envelopeId} onChange={setEnvelopeId} />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Date</Text>
        <DateField value={date} onChange={setDate} />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Amount ($)</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" className="text-input text-grey-400 dark:text-white" />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Comments</Text>
        <TextInput value={comments} onChangeText={setComments} multiline numberOfLines={3} textAlignVertical="top" className="text-input text-grey-400 dark:text-white min-h-16" />

        <View className="flex-row justify-center mt-6">
          <Pressable onPress={handleSave} disabled={saving} className="px-5 py-2 mx-2 bg-blue-light rounded-md">
            <Text className="text-white font-semibold">{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} className="px-5 py-2 mx-2 bg-red rounded-md">
            <Text className="text-white font-semibold">Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  );
}

function IncomeEdit({ income }: { income: Income }) {
  const router = useRouter();
  const [source, setSource] = useState(income.source);
  const [amount, setAmount] = useState(String(income.amount));
  const [date, setDate] = useState(income.date);
  const [savings, setSavings] = useState(String(income.savings ?? 0));
  const [investments, setInvestments] = useState(String(income.investments ?? 0));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    if (!source || !date || !parsedAmount) {
      Alert.alert('Please fill in all required fields.');
      return;
    }
    const s = Number(savings) || 0;
    const inv = Number(investments) || 0;
    setSaving(true);
    try {
      await updateIncome(income.id, {
        source, amount: parsedAmount, date,
        savings: s, investments: inv,
        remainder: parsedAmount - s - inv,
      });
      showToast.success('Income saved');
      router.back();
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete this income?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteIncome(income.id); showToast.success('Income deleted'); router.back(); }
          catch (e: any) { Alert.alert('Delete failed', e.message); }
        },
      },
    ]);
  };

  return (
    <Layout>
      <ScrollView className="p-4">
        <Text className="header text-xl font-semibold text-center text-grey-400 dark:text-white">Edit Income</Text>

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Source</Text>
        <TextInput value={source} onChangeText={setSource} className="text-input text-grey-400 dark:text-white" />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Date</Text>
        <DateField value={date} onChange={setDate} />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Amount ($)</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" className="text-input text-grey-400 dark:text-white" />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Savings</Text>
        <TextInput value={savings} onChangeText={setSavings} keyboardType="decimal-pad" className="text-input text-grey-400 dark:text-white" />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Investments</Text>
        <TextInput value={investments} onChangeText={setInvestments} keyboardType="decimal-pad" className="text-input text-grey-400 dark:text-white" />

        <View className="flex-row justify-center mt-6">
          <Pressable onPress={handleSave} disabled={saving} className="px-5 py-2 mx-2 bg-blue-light rounded-md">
            <Text className="text-white font-semibold">{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} className="px-5 py-2 mx-2 bg-red rounded-md">
            <Text className="text-white font-semibold">Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  );
}

function EnvelopeEdit({ envelope }: { envelope: Envelope }) {
  const router = useRouter();
  const [title, setTitle] = useState(envelope.title);
  const [budget, setBudget] = useState(String(envelope.budget));
  const [fixed, setFixed] = useState(envelope.fixed);
  const [color, setColor] = useState(envelope.color);
  const [comments, setComments] = useState(envelope.comments ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsedBudget = Number(budget);
    if (!title || isNaN(parsedBudget)) {
      Alert.alert('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      await updateEnvelope(envelope.id, {
        title, budget: parsedBudget, fixed, color,
        icon: envelope.icon,
        comments: comments.trim() || null,
        addExpense: null, removeExpense: null,
      });
      showToast.success('Envelope saved');
      router.back();
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete this envelope?',
      'Any expenses linked to it must be moved first.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try { await deleteEnvelope(envelope.id); showToast.success('Envelope deleted'); router.back(); }
            catch (e: any) { Alert.alert('Delete failed', e.message); }
          },
        },
      ]
    );
  };

  return (
    <Layout>
      <ScrollView className="p-4">
        <Text className="header text-xl font-semibold text-center text-grey-400 dark:text-white">Edit Envelope</Text>

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Title</Text>
        <TextInput value={title} onChangeText={setTitle} className="text-input text-grey-400 dark:text-white" />

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Budget ($)</Text>
        <TextInput value={budget} onChangeText={setBudget} keyboardType="decimal-pad" className="text-input text-grey-400 dark:text-white" />

        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-grey-400 dark:text-white">Fixed budget</Text>
          <Switch value={fixed} onValueChange={setFixed} />
        </View>

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Color</Text>
        <View className="flex-row flex-wrap mt-2">
          {PALETTE.map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => setColor(swatch)}
              className={`w-8 h-8 rounded-full mr-2 mb-2 ${color === swatch ? 'border-2 border-grey-400' : ''}`}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </View>

        <Text className="text-sm font-medium mt-4 text-grey-400 dark:text-white">Comments</Text>
        <TextInput value={comments} onChangeText={setComments} multiline numberOfLines={3} textAlignVertical="top" className="text-input text-grey-400 dark:text-white min-h-16" />

        <View className="flex-row justify-center mt-6">
          <Pressable onPress={handleSave} disabled={saving} className="px-5 py-2 mx-2 bg-blue-light rounded-md">
            <Text className="text-white font-semibold">{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} className="px-5 py-2 mx-2 bg-red rounded-md">
            <Text className="text-white font-semibold">Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  );
}
