import "~/global.css";

import * as React from "react";
import { View, Image, TouchableOpacity, Platform, LogBox } from "react-native";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { Tabs, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useColorScheme } from "../lib/useColorScheme";
import { NAV_THEME } from "../lib/constants";
import { ThemeToggle } from "~/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { PortalHost } from "@rn-primitives/portal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Text } from "react-native"; // Use standard RN Text for headerTitle and menus
import { useFonts } from "expo-font"; // Import useFonts

// Suppress all warnings and logs
LogBox.ignoreAllLogs();

// Flags
const MoroccanFlag = require("~/assets/images/flags/ma.png");
const FrenchFlag = require("~/assets/images/flags/fr.png");
const USFlag = require("~/assets/images/flags/us.png");

const LIGHT_THEME: Theme = { ...DefaultTheme, colors: NAV_THEME.light };
const DARK_THEME: Theme = { ...DarkTheme, colors: NAV_THEME.dark };

export { ErrorBoundary } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = isDarkColorScheme ? DARK_THEME : LIGHT_THEME;
  const colors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  const [fontsLoaded, fontError] = useFonts({
    "Jaro-Regular-VariableFont_opsz": require("../assets/fonts/Jaro-Regular-VariableFont_opsz.ttf"),
    "Staatliches-Regular": require("../assets/fonts/Staatliches-Regular.ttf"),
  });

  const languageOptions = [
    { code: "ar", name: "العربية", flag: MoroccanFlag },
    { code: "fr", name: "Français", flag: FrenchFlag },
    { code: "en", name: "English", flag: USFlag },
  ];
  const [selectedLanguage, setSelectedLanguage] = React.useState(
    languageOptions[0]
  );

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Return null or a loading indicator while fonts are loading
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
          edges={["top"]}
        >
          {/* Custom Header */}
          <View
            style={{
              height: 60,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 15,
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="book-open-page-variant-outline"
                color={colors.text}
                size={26}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Jaro-Regular-VariableFont_opsz",
                  fontSize: 20,
                }}
              >
                Lawazimi
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      marginLeft: 8,
                    }}
                  >
                    <Image
                      source={selectedLanguage.flag}
                      style={{ width: 24, height: 16, marginRight: 4 }}
                    />
                    <Icon name="chevron-down" size={18} color={colors.text} />
                  </TouchableOpacity>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }}
                >
                  {languageOptions.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onPress={() => setSelectedLanguage(lang)}
                      style={{ paddingVertical: 10 }}
                    >
                      <Image
                        source={lang.flag}
                        style={{ width: 20, height: 12, marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: colors.text,
                          fontFamily: "Staatliches-Regular",
                        }}
                      >
                        {lang.name}
                      </Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>

          <Tabs
            screenOptions={{
              headerShown: false, // Hide built-in header, we'll use our own
              tabBarLabelStyle: {
                fontFamily: "Staatliches-Regular",
                fontSize: 12,
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.text,
              tabBarStyle: {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom,
                height: 50 + insets.bottom,
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                tabBarLabel: "Accueil",
                tabBarIcon: ({ color, size }) => (
                  <Icon name="home-outline" color={color} size={size} />
                ),
                headerShown: false, // hide this screen's header too
              }}
            />
            <Tabs.Screen
              name="orders"
              options={{
                tabBarLabel: "Commandes",
                tabBarIcon: ({ color, size }) => (
                  <Icon name="view-grid-outline" color={color} size={size} />
                ),
              }}
            />
            <Tabs.Screen
              name="about"
              options={{
                tabBarLabel: "À Propos",
                tabBarIcon: ({ color, size }) => (
                  <Icon name="information-outline" color={color} size={size} />
                ),
              }}
            />
          </Tabs>
          <PortalHost />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
