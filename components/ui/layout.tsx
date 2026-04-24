import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LayoutProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Layout({ children, scroll = true }: LayoutProps) {
  const content = <View className="main-container p-4">{children}</View>;

  return (
    <SafeAreaView className="flex-1 bg-grey-100 dark:bg-black" edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerClassName="grow">{content}</ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
