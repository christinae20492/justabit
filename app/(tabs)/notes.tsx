import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Layout } from '@/components/ui/layout';
import { Note } from '@/types';
import { deleteNote, getNotes } from '@/utils/db/notes';
import { getMonthName } from '@/utils/expenses';
import { showToast } from '@/utils/toast';

const currentMonth = new Date().getMonth();

export default function NotesScreen() {
  const router = useRouter();
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setNotes(await getNotes());
    } catch (e: any) {
      Alert.alert('Error loading notes', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const monthNotes = useMemo(
    () => notes.filter((note) => note.month === displayMonth),
    [notes, displayMonth]
  );

  const increment = () => setDisplayMonth((m) => (m + 1) % 12);
  const decrement = () => setDisplayMonth((m) => (m - 1 + 12) % 12);

  const handleDelete = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNote(id);
      showToast.success('Note deleted');
    } catch (e: any) {
      Alert.alert('Delete failed', e.message);
      load();
    }
  };

  return (
    <Layout>
      <Text className="header text-2xl font-bold text-center text-grey-400 dark:text-white">
        Notes
      </Text>

      <View className="flex-row items-center justify-center my-2">
        <Pressable onPress={decrement} className="px-3 py-1">
          <Text className="text-grey-300">Previous</Text>
        </Pressable>
        <Text className="mx-4 font-bold text-lg text-grey-400 dark:text-white">
          {getMonthName(displayMonth)}
        </Text>
        <Pressable onPress={increment} className="px-3 py-1">
          <Text className="text-grey-300">Next</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <ScrollView className="mt-2">
          {monthNotes.length === 0 ? (
            <Text className="text-center text-lg text-grey-300 mt-8">
              No notes for this month.
            </Text>
          ) : (
            monthNotes.map((note) => (
              <View
                key={note.id}
                className="border border-notindigo-400 rounded-xl my-2 mx-4 p-4 shadow relative">
                <Text className="text-base text-grey-400 dark:text-white pr-8">
                  {note.content}
                </Text>
                <Pressable
                  onPress={() => handleDelete(note.id)}
                  className="absolute top-2 right-2 p-2">
                  <MaterialIcons name="delete-outline" size={22} color="#ad3d3d" />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Pressable
        onPress={() => router.push('/notes/add-note')}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-notindigo-200 items-center justify-center shadow-lg">
        <MaterialIcons name="edit" size={26} color="#ffffff" />
      </Pressable>
    </Layout>
  );
}
