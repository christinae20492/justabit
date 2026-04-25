import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { Layout } from '@/components/ui/layout';
import { createNote } from '@/utils/db/notes';
import { showToast } from '@/utils/toast';

export default function CreateNoteScreen() {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) {
      Alert.alert('The note is empty.');
      return;
    }
    setLoading(true);
    try {
      await createNote({ month: new Date().getMonth(), content: body.trim() });
      showToast.success('Note saved');
      router.back();
    } catch (e: any) {
      Alert.alert('Failed to save note', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <View className="max-w-2xl mx-auto mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Text className="header text-xl font-semibold text-grey-400 dark:text-white">
          Create a Note
        </Text>

        <Text className="text-sm font-medium text-grey-400 dark:text-white mt-4">
          What do you have to say?
        </Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          placeholder="Write your note here..."
          placeholderTextColor="#a3a3a3"
          className="text-input text-grey-400 dark:text-white min-h-48"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="self-center mt-6 px-4 py-2 rounded-md bg-blue-light">
          <Text className="text-white font-semibold">{loading ? 'Saving…' : 'Add Note'}</Text>
        </Pressable>
      </View>
    </Layout>
  );
}
