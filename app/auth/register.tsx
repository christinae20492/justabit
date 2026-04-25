import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { setPendingLogin } from '@/utils/pendingLogin';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, username.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Registration failed', error);
    } else {
      setPendingLogin(email.trim(), password);
      router.replace('/auth/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-pale items-center justify-center p-4">
      <View className="w-full max-w-md bg-white dark:bg-gray-800 border-2 border-grey-600 dark:border-grey-500 p-8 rounded-xl shadow-2xl">
        <Text className="text-3xl font-extrabold text-grey-400 dark:text-white text-center mb-1">
          Create Account
        </Text>
        <Text className="text-center text-sm text-grey-300 dark:text-grey-200 mb-6">
          Start tracking your budget today.
        </Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Username"
          placeholderTextColor="#a3a3a3"
          className="w-full px-4 py-3 border border-grey-150 dark:border-grey-500 rounded-lg text-grey-400 dark:text-white dark:bg-gray-700 mb-4"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          placeholderTextColor="#a3a3a3"
          className="w-full px-4 py-3 border border-grey-150 dark:border-grey-500 rounded-lg text-grey-400 dark:text-white dark:bg-gray-700 mb-4"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#a3a3a3"
          className="w-full px-4 py-3 border border-grey-150 dark:border-grey-500 rounded-lg text-grey-400 dark:text-white dark:bg-gray-700 mb-4"
        />

        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="Confirm Password"
          placeholderTextColor="#a3a3a3"
          className="w-full px-4 py-3 border border-grey-150 dark:border-grey-500 rounded-lg text-grey-400 dark:text-white dark:bg-gray-700 mb-2"
        />

        <Pressable
          onPress={handleSignUp}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-blue items-center mt-4 disabled:opacity-50">
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Creating account...' : 'Create Account'}
          </Text>
        </Pressable>

        <Text className="text-center text-sm text-grey-300 dark:text-grey-200 mt-5">
          Already have an account?{' '}
          <Text
            onPress={() => router.back()}
            className="font-medium text-blue dark:text-blue-light">
            Log in
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
