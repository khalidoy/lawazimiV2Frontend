import { Stack } from "expo-router"; // Use Expo Router's Stack

export default function MainStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="store" />
    </Stack>
  );
}
