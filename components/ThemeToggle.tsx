import { Pressable, View } from "react-native";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";
import { NAV_THEME } from "~/lib/constants"; // Import NAV_THEME

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light; // Determine colors

  function toggleColorScheme() {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
  }

  return (
    <Pressable
      onPress={toggleColorScheme}
      className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2"
    >
      {({ pressed }) => (
        <View
          className={cn(
            "flex-1 aspect-square pt-0.5 justify-center items-start web:px-5",
            pressed && "opacity-70"
          )}
        >
          {isDarkColorScheme ? (
            <Icon
              name="moon-waning-crescent"
              size={23}
              color={colors.text} // Use explicit color
            />
          ) : (
            <Icon
              name="white-balance-sunny"
              size={24}
              color={colors.text} // Use explicit color
            />
          )}
        </View>
      )}
    </Pressable>
  );
}
