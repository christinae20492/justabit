import { supabase } from '@/utils/supabase';
import { EditExpense, Expense, NewExpense } from '@/types';

function map(row: any): Expense {
  return {
    id: row.id,
    location: row.location,
    envelopeId: row.envelope_id,
    userId: row.user_id,
    date: row.date,
    amount: row.amount,
    comments: row.comments ?? null,
    dateCreated: new Date(row.date_created),
    dateUpdated: new Date(row.date_updated),
  };
}

export async function getExpense(id: string): Promise<Expense | null> {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? map(data) : null;
}

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(map);
}

export async function getExpensesByDate(date: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('date', date)
    .order('date_created', { ascending: false });
  if (error) throw error;
  return data.map(map);
}

export async function createExpense(input: Omit<NewExpense, 'id'>): Promise<Expense> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      location: input.location,
      envelope_id: input.envelopeId,
      user_id: session.user.id,
      date: input.date,
      amount: input.amount,
      comments: input.comments ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

export async function updateExpense(id: string, input: EditExpense): Promise<Expense> {
  const updates: Record<string, any> = {};
  if (input.location !== null) updates.location = input.location;
  if (input.envelopeId !== null) updates.envelope_id = input.envelopeId;
  if (input.date !== null) updates.date = input.date;
  if (input.amount !== null) updates.amount = input.amount;
  updates.comments = input.comments;
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}
