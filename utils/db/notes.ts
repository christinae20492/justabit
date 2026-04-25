import { supabase } from '@/utils/supabase';
import { EditNote, Note, NewNote } from '@/types';

function map(row: any): Note {
  return {
    id: row.id,
    month: row.month,
    content: row.content,
    userId: row.user_id,
    dateCreated: new Date(row.date_created),
    dateUpdated: new Date(row.date_updated),
  };
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? map(data) : null;
}

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('date_created', { ascending: false });
  if (error) throw error;
  return data.map(map);
}

export async function createNote(input: Omit<NewNote, 'id'>): Promise<Note> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('notes')
    .insert({
      month: input.month,
      content: input.content,
      user_id: session.user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

export async function updateNote(id: string, input: EditNote): Promise<Note> {
  const updates: Record<string, any> = {};
  if (input.content !== null) updates.content = input.content;
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return map(data);
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}
