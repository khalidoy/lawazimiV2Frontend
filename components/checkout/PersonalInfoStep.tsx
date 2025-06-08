import * as React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";

interface PersonalInfoStepProps {
  clientName: string;
  setClientName: (name: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
}

// Reusable Form Field Component with animations
interface FormFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  iconName: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  navColors: any;
  index: number;
  error?: string;
}

// Validation functions
const validateName = (name: string): boolean => {
  // Arabic and Latin letters, spaces, hyphens, apostrophes, at least 2 characters
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s\-']{2,}$/;
  return nameRegex.test(name.trim());
};

const validateMoroccanPhone = (phone: string): boolean => {
  // Remove all spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");

  // Pattern 1: +212XXXXXXXXX (9 digits after 212)
  // Pattern 2: 212XXXXXXXXX (9 digits after 212)
  // Pattern 3: 0XXXXXXXXX (9 digits after 0)
  const phoneRegex = /^(\+?212[5-7]\d{8}|0[5-7]\d{8})$/;

  return phoneRegex.test(cleanPhone);
};

const FormField: React.FC<FormFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  iconName,
  keyboardType = "default",
  navColors,
  index,
  error,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const borderColor = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        scale: interpolate(
          opacity.value,
          [0.7, 1],
          [1, 1.1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? navColors.destructive || "#ef4444"
      : borderColor.value === 1
      ? navColors.primary
      : navColors.border,
    borderWidth: 2,
  }));

  const handleFocus = () => {
    scale.value = withSpring(1.02, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
    borderColor.value = withTiming(1, { duration: 300 });
  };

  const handleBlur = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(0.7, { duration: 200 });
    borderColor.value = withTiming(0, { duration: 300 });
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100)
        .duration(600)
        .springify()
        .damping(20)}
      style={[animatedStyle, { marginBottom: 12 }]}
    >
      <View style={{ position: "relative" }}>
        <Animated.View
          style={[
            {
              borderRadius: 12,
              borderWidth: 2,
              backgroundColor: navColors.background,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 6,
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 12,
            },
            borderAnimatedStyle,
          ]}
        >
          {/* Icon */}
          <Animated.View style={[iconAnimatedStyle, { marginRight: 12 }]}>
            <MaterialCommunityIcons
              name={iconName as any}
              size={20}
              color={
                error
                  ? navColors.destructive || "#ef4444"
                  : borderColor.value === 1
                  ? navColors.primary
                  : navColors.text
              }
            />
          </Animated.View>

          {/* Input */}
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            returnKeyType={keyboardType === "phone-pad" ? "done" : "default"}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              flex: 1,
              paddingLeft: 0,
              paddingRight: 16,
              height: 48,
              fontSize: 16,
              fontWeight: "500",
              backgroundColor: "transparent",
              color: navColors.text,
              borderWidth: 0,
              borderRadius: 12,
            }}
            placeholderTextColor={navColors.border}
          />
        </Animated.View>
        {error && (
          <Text
            style={{
              color: navColors.destructive || "#ef4444",
              fontSize: 12,
              marginTop: 4,
              marginLeft: 4,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

export default function PersonalInfoStep({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
}: PersonalInfoStepProps) {
  const { isDarkColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  // State for validation errors
  const [nameError, setNameError] = React.useState<string>("");
  const [phoneError, setPhoneError] = React.useState<string>("");

  // Animation values
  const headerScale = useSharedValue(0);
  const headerOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerScale.value = withSpring(1, { damping: 20, stiffness: 200 });
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));
  // Validation handlers
  const handleNameChange = (text: string) => {
    setClientName(text);
    if (text.trim() && !validateName(text)) {
      setNameError(
        "Le nom doit contenir au moins 2 caractères (lettres uniquement)"
      );
    } else {
      setNameError("");
    }
  };

  const handlePhoneChange = (text: string) => {
    setClientPhone(text);
    if (text.trim() && !validateMoroccanPhone(text)) {
      setPhoneError("Format: +212XXXXXXXXX, 212XXXXXXXXX ou 0XXXXXXXXX");
    } else {
      setPhoneError("");
    }
  };
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Compact Header Section */}{" "}
      <Animated.View
        style={[{ marginBottom: 8 }, headerAnimatedStyle]}
        entering={FadeInUp.duration(600).springify().damping(18)}
      >
        <View
          style={{
            alignItems: "center",
            marginBottom: 4,
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: colors.border + "20",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={20}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                textAlign: "center",
                marginBottom: 1,
                fontFamily: "Staatliches",
              }}
            >
              Informations Personnelles
            </Text>
          </View>

          <Text
            style={{
              fontSize: 11,
              color: colors.text,
              opacity: 0.7,
              textAlign: "center",
              lineHeight: 14,
            }}
          >
            Remplissez vos informations
          </Text>
        </View>
      </Animated.View>
      {/* Main Form Section - positioned high to avoid keyboard */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(800).springify().damping(16)}
        style={{ marginTop: 8 }}
      >
        {" "}
        <Card
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border + "40",
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <CardHeader style={{ padding: 0, marginBottom: 8 }}>
            <CardTitle
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 1,
                fontFamily: "Staatliches",
              }}
            >
              Vos Détails
            </CardTitle>
            <CardDescription
              style={{
                fontSize: 11,
                color: colors.text,
                opacity: 0.7,
                lineHeight: 14,
              }}
            >
              Nom complet et numéro de téléphone
            </CardDescription>
          </CardHeader>

          <CardContent style={{ padding: 0 }}>
            <FormField
              value={clientName}
              onChangeText={handleNameChange}
              placeholder="Nom complet"
              iconName="account-outline"
              navColors={colors}
              index={0}
              error={nameError}
            />{" "}
            <FormField
              value={clientPhone}
              onChangeText={handlePhoneChange}
              placeholder="Numéro de téléphone"
              iconName="phone-outline"
              keyboardType="phone-pad"
              navColors={colors}
              index={1}
              error={phoneError}
            />
          </CardContent>
        </Card>
      </Animated.View>
      {/* Simple Privacy Info at Bottom */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(800).springify().damping(18)}
        style={{ marginTop: 16 }}
      >
        {" "}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={14}
                color={colors.card}
              />
            </View>
            <Text
              style={{
                color: colors.text,
                flex: 1,
                fontSize: 12,
                lineHeight: 16,
                opacity: 0.8,
              }}
            >
              Vos données sont protégées et utilisées uniquement pour votre
              commande
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
