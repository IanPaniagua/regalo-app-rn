import { Stack } from 'expo-router';

export default function CreateProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="hobbies" />
      <Stack.Screen name="email" />
    </Stack>
  );
}
