import { supabase } from '@/utils/supabase';
import { EditEnvelope, Envelope, NewEnvelope } from '@/types';

function map(row: any): Envelope {
  return {
    id: row.id,
    title: row.title,
    fixed: row.fixed,
    budget: row.budget,
    icon: row.icon,
    color: row.color,
    comments: row.comments ?? null,
    userId: row.user_id,
    dateCreated: new Date(row.date_created),
    dateUpdated: new Date(row.date_updated),
  };
}

export async function getEnvelope(id: string): Promise<Envelope | null> {
  const { data, error } = await supabase.from('envelopes').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? map(data) : null;
}

export async function getEnvelopes(): Promise<Envelope[]> {
  const { data, error } = await supabase
    .from('envelopes')
    .select('*')
    .order('title');
  if (error) throw error;
  return data.map(map);
}

export async function createEnvelope(input: Omit<NewEnvelope, 'expenses'>): Promise<Envelope> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('envelopes')
    .insert({
      title: input.title,
      fixed: input.fixed,
      budget: input.budget,
      icon: input.icon,
      color: input.color,
      comments: input.comments ?? null,
      user_id: session.user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

// EditEnvelope.addExpense / .removeExpense are web-app-only fields — ignored here.
export async function updateEnvelope(id: string, input: EditEnvelope): Promise<Envelope> {
  const updates: Record<string, any> = {};
  if (input.title != null) updates.title = input.title;
  if (input.fixed != null) updates.fixed = input.fixed;
  if (input.budget != null) updates.budget = input.budget;
  if (input.icon != null) updates.icon = input.icon;
  if (input.color != null) updates.color = input.color;
  updates.comments = input.comments ?? null;
  const { data, error } = await supabase
    .from('envelopes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

export async function deleteEnvelope(id: string): Promise<void> {
  const { error } = await supabase.from('envelopes').delete().eq('id', id);
  if (error) throw error;
}
