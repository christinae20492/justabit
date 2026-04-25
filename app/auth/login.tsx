import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { consumePendingLogin } from '@/utils/pendingLogin';
import { showToast } from '@/utils/toast';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pending = consumePendingLogin();
    if (pending) {
      setIdentifier(pending.identifier);
      setPassword(pending.password);
    }
  }, []);

  const handleSignIn = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Please enter your email or username and password.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(identifier.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Sign in failed', error);
    } else {
      showToast.success('Welcome back!', 'Signed in successfully.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-pale items-center justify-center p-4">
      <View className="w-full max-w-md bg-white dark:bg-gray-800 border-2 border-grey-600 dark:border-grey-500 p-8 rounded-xl shadow-2xl">
        <Text className="text-3xl font-extrabold text-grey-400 dark:text-white text-center mb-1">
          Welcome Back!
        </Text>
        <Text className="text-center text-sm text-grey-300 dark:text-grey-200 mb-6">
          Sign in to access your expenses.
        </Text>

        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Username or Email"
          placeholderTextColor="#a3a3a3"
          className="w-full px-4 py-3 border border-grey-150 dark:border-grey-500 rounded-lg text-grey-400 dark:text-white dark:bg-gray-700 mb-4"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#a3a3a3"
          className="w-full px-4 py-3 border border-grey-150 dark:border-grey-500 rounded-lg text-grey-400 dark:text-white dark:bg-gray-700 mb-2"
        />

        <Pressable
          onPress={handleSignIn}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-blue items-center mt-4 disabled:opacity-50">
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </Pressable>

        <Text className="text-center text-sm text-grey-300 dark:text-grey-200 mt-5">
          Don't have an account?{' '}
          <Text
            onPress={() => router.push('/auth/register')}
            className="font-medium text-blue dark:text-blue-light">
            Register here
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
