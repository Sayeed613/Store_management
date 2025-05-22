import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-semibold">Settings</Text>
    </SafeAreaView>
  );
}
