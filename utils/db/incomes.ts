import { supabase } from '@/utils/supabase';
import { EditIncome, Income, NewIncome } from '@/types';

function map(row: any): Income {
  return {
    id: row.id,
    source: row.source,
    amount: row.amount,
    date: row.date,
    userId: row.user_id,
    savings: row.savings ?? null,
    investments: row.investments ?? null,
    remainder: row.remainder ?? null,
    dateCreated: new Date(row.date_created),
    dateUpdated: new Date(row.date_updated),
  };
}

export async function getIncome(id: string): Promise<Income | null> {
  const { data, error } = await supabase.from('incomes').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? map(data) : null;
}

export async function getIncomes(): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(map);
}

export async function getIncomesByDate(date: string): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('date', date)
    .order('date_created', { ascending: false });
  if (error) throw error;
  return data.map(map);
}

export async function createIncome(input: Omit<NewIncome, 'id'>): Promise<Income> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('incomes')
    .insert({
      source: input.source,
      amount: input.amount,
      date: input.date,
      user_id: session.user.id,
      savings: input.savings ?? null,
      investments: input.investments ?? null,
      remainder: input.remainder ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

export async function updateIncome(id: string, input: EditIncome): Promise<Income> {
  const updates: Record<string, any> = {};
  if (input.source !== null) updates.source = input.source;
  if (input.amount !== null) updates.amount = input.amount;
  if (input.date !== null) updates.date = input.date;
  updates.savings = input.savings;
  updates.investments = input.investments;
  updates.remainder = input.remainder;
  const { data, error } = await supabase
    .from('incomes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) throw error;
}
