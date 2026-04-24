import { Text, View } from 'react-native';

export function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-grey-50 dark:bg-grey-500">
      <Text className="text-grey-400 dark:text-white text-lg">
        TODO: port {name}
      </Text>
    </View>
  );
}
