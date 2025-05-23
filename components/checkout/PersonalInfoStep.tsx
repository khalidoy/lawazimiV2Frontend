import * as React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants"; // Use NAV_THEME

interface PersonalInfoStepProps {
  onNext: () => void;
  clientName: string;
  setClientName: (name: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
}

export default function PersonalInfoStep({
  onNext,
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
}: PersonalInfoStepProps) {
  const { isDarkColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light; // Use NAV_THEME and its properties

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}>
          Remplissez votre nom complet et votre numéro de téléphone.
        </Text>

        <View>
          <View style={{ position: "relative", marginBottom: 20 }}>
            <Input
              value={clientName}
              onChangeText={setClientName}
              placeholder="Nom complet"
              style={{
                paddingLeft: 40,
                height: 48,
                fontSize: 16,
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
              }}
              placeholderTextColor={colors.border} // Changed from muted-foreground to border for a more subtle placeholder
            />
            <View
              style={{
                position: "absolute",
                left: 12,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
            >
              <Icon name="account-outline" size={20} color={colors.text} />
            </View>
          </View>
          <View style={{ position: "relative", marginBottom: 20 }}>
            <Input
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="Numéro de téléphone"
              keyboardType="phone-pad"
              style={{
                paddingLeft: 40,
                height: 48,
                fontSize: 16,
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
              }}
              placeholderTextColor={colors.border} // Changed from muted-foreground to border
            />
            <View
              style={{
                position: "absolute",
                left: 12,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
            >
              <Icon name="phone-outline" size={20} color={colors.text} />
            </View>
          </View>
        </View>
      </View>

      <Card
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <CardContent style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                height: 28,
                width: 28,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Icon name="check-circle-outline" size={18} color={colors.card} />
            </View>
            <Text
              style={{
                color: colors.text,
                flex: 1,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Nous utilisons vos informations uniquement pour traiter votre
              commande et vous fournir des mises à jour de livraison.
            </Text>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
