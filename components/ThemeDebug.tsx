import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

export function ThemeDebug() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className="p-2 border border-primary rounded-md">
      <Text className="text-foreground">
        Current theme: {isDarkColorScheme ? "Dark" : "Light"}
      </Text>
      <View className="mt-1 flex-row space-x-2">
        <View className="h-4 w-4 bg-primary rounded-full" />
        <View className="h-4 w-4 bg-background rounded-full border border-border" />
        <View className="h-4 w-4 bg-card rounded-full border border-border" />
        <View className="h-4 w-4 bg-muted rounded-full" />
      </View>
    </View>
  );
}
