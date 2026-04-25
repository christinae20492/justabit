import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Layout } from '@/components/ui/layout';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { supabase } from '@/utils/supabase';

type Tab = 'Account' | 'Preferences' | 'Actions';
type ProfileType = 'Personal' | 'Business' | 'Shared' | '';

const TABS: Tab[] = ['Account', 'Preferences', 'Actions'];
const PROFILE_TYPES: ProfileType[] = ['Personal', 'Business', 'Shared'];

interface Profile {
  username: string;
  email: string;
  type: string;
  dark_mode: boolean;
  opt_in_emails: boolean;
}

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('Account');
  const [loading, setLoading] = useState(true);

  // Account tab
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('');
  const [saving, setSaving] = useState(false);

  // Preferences tab
  const [darkMode, setDarkMode] = useState(false);
  const [optInEmails, setOptInEmails] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Delete flow
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadProfile(); }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('username, email, type, dark_mode, opt_in_emails')
      .eq('id', user.id)
      .single();
    if (error) {
      Alert.alert('Error loading profile', error.message);
    } else if (data) {
      const p = data as Profile;
      setUsername(p.username ?? '');
      setEmail(p.email ?? '');
      setProfileType((p.type as ProfileType) ?? '');
      setDarkMode(p.dark_mode ?? false);
      setOptInEmails(p.opt_in_emails ?? true);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: Partial<Profile & { type: string }> = {
        username: username.trim(),
        type: profileType,
      };

      if (email.trim() !== user.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email: email.trim() });
        if (authErr) throw authErr;
        updates.email = email.trim();
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;

      showToast.success('Profile updated');
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dark_mode: darkMode, opt_in_emails: optInEmails })
        .eq('id', user.id);
      if (error) throw error;
      showToast.success('Preferences saved');
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Enter your password to confirm deletion.');
      return;
    }
    if (!email) {
      Alert.alert('Profile not loaded yet. Try again.');
      return;
    }
    setDeleting(true);
    try {
      // Re-authenticate to confirm identity
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password: deletePassword,
      });
      if (authErr) throw new Error('Incorrect password.');

      // Delete auth user (cascades all data via FK)
      const { error: deleteErr } = await supabase.rpc('delete_user');
      if (deleteErr) throw deleteErr;

      await signOut();
      router.replace('/auth/login');
    } catch (e: any) {
      Alert.alert('Deletion failed', e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <Layout>
        <ActivityIndicator className="mt-8" />
      </Layout>
    );
  }

  return (
    <Layout>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="header text-2xl font-bold text-grey-400 dark:text-white">
          Hello, {username || 'there'}
        </Text>
        <Pressable onPress={handleSignOut} className="px-3 py-1 rounded bg-red">
          <Text className="text-white text-sm font-semibold">Sign Out</Text>
        </Pressable>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-grow-0 mb-4 border-b border-grey-100 dark:border-grey-600">
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`px-5 py-2 mr-1 border-b-2 ${
              tab === t
                ? 'border-blue'
                : 'border-transparent'
            }`}>
            <Text
              className={`text-sm font-semibold ${
                tab === t ? 'text-blue dark:text-blue-light' : 'text-grey-300'
              }`}>
              {t}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Account tab ─────────────────────────────────── */}
      {tab === 'Account' && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
          <Text className="text-xl font-semibold text-grey-400 dark:text-white mb-4 text-center">
            Update Profile Details
          </Text>

          <Text className="text-sm font-medium text-grey-400 dark:text-white mb-1">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="yourname"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white mb-4"
            editable={!saving}
          />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mb-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            placeholderTextColor="#a3a3a3"
            className="text-input text-grey-400 dark:text-white mb-4"
            editable={!saving}
          />

          <Text className="text-sm font-medium text-grey-400 dark:text-white mb-2">
            Profile Type
          </Text>
          <View className="flex-row gap-2 mb-6">
            {PROFILE_TYPES.map((pt) => (
              <Pressable
                key={pt}
                onPress={() => setProfileType(pt)}
                className={`flex-1 py-2 rounded-md items-center border ${
                  profileType === pt
                    ? 'bg-blue border-blue'
                    : 'bg-transparent border-grey-150 dark:border-grey-500'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    profileType === pt ? 'text-white' : 'text-grey-300 dark:text-grey-200'
                  }`}>
                  {pt}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleSaveProfile}
            disabled={saving}
            className="self-center px-8 py-2 rounded-md bg-green items-center">
            <Text className="text-white font-semibold">
              {saving ? 'Saving...' : 'Save Profile'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── Preferences tab ─────────────────────────────── */}
      {tab === 'Preferences' && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
          <Text className="text-xl font-semibold text-grey-400 dark:text-white mb-5 text-center">
            User Preferences
          </Text>

          <View className="mb-5 p-4 border border-grey-100 dark:border-grey-600 rounded-lg">
            <Text className="text-base font-semibold text-grey-400 dark:text-white mb-3">
              Theme Preference
            </Text>
            <View className="flex-row gap-3">
              {[false, true].map((isDark) => (
                <Pressable
                  key={String(isDark)}
                  onPress={() => setDarkMode(isDark)}
                  className={`flex-1 py-2 rounded-md items-center border ${
                    darkMode === isDark
                      ? 'bg-blue border-blue'
                      : 'bg-transparent border-grey-150 dark:border-grey-500'
                  }`}>
                  <Text
                    className={`text-sm font-medium ${
                      darkMode === isDark ? 'text-white' : 'text-grey-300 dark:text-grey-200'
                    }`}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-6 p-4 border border-grey-100 dark:border-grey-600 rounded-lg">
            <Text className="text-base font-semibold text-grey-400 dark:text-white mb-1">
              Email Subscriptions
            </Text>
            <Text className="text-xs text-grey-300 mb-3">
              Receive optional product updates and tips.
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-grey-400 dark:text-white">
                {optInEmails ? 'Subscribed' : 'Unsubscribed'}
              </Text>
              <Switch
                value={optInEmails}
                onValueChange={setOptInEmails}
                trackColor={{ false: '#757575', true: '#52808D' }}
                thumbColor={optInEmails ? '#9ED5E5' : '#cccccc'}
              />
            </View>
          </View>

          <Pressable
            onPress={handleSavePreferences}
            disabled={savingPrefs}
            className="self-center px-8 py-2 rounded-md bg-green items-center">
            <Text className="text-white font-semibold">
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── Actions tab ─────────────────────────────────── */}
      {tab === 'Actions' && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
          <Text className="text-xl font-semibold text-grey-400 dark:text-white mb-4 text-center">
            Data & Privacy
          </Text>

          <View className="mb-6 gap-3">
            <Text className="text-sm text-grey-400 dark:text-grey-200 leading-5">
              We understand the sensitivity of your personal and financial information. Your account
              details and financial data are used solely to provide budgeting services and improve
              your experience.
            </Text>
            <Text className="text-sm text-grey-400 dark:text-grey-200 leading-5">
              We employ robust security measures, including encryption, to safeguard your information.
              Your data is never sold or shared with third parties for marketing purposes.
            </Text>
            <Text className="text-sm text-grey-400 dark:text-grey-200 leading-5">
              You maintain complete control. You can update your details, manage preferences, and
              permanently delete your account and all associated data at any time.
            </Text>
          </View>

          {!showDeleteForm ? (
            <Pressable
              onPress={() => setShowDeleteForm(true)}
              className="self-center px-6 py-2 rounded-md bg-red">
              <Text className="text-white font-semibold">Delete Account</Text>
            </Pressable>
          ) : (
            <View className="border border-red rounded-lg p-4 gap-3">
              <Text className="text-sm font-semibold text-red text-center">
                This will permanently delete your account and all data.
              </Text>
              <Text className="text-sm text-grey-400 dark:text-white">
                Enter your password to confirm:
              </Text>
              <TextInput
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#a3a3a3"
                className="text-input text-grey-400 dark:text-white"
                editable={!deleting}
              />
              <View className="flex-row gap-3 justify-center mt-1">
                <Pressable
                  onPress={() => { setShowDeleteForm(false); setDeletePassword(''); }}
                  disabled={deleting}
                  className="px-5 py-2 rounded-md border border-grey-150">
                  <Text className="text-grey-400 dark:text-white font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                  className="px-5 py-2 rounded-md bg-red">
                  <Text className="text-white font-semibold">
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </Layout>
  );
}
