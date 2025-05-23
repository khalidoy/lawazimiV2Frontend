import * as React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { User, Phone, Check } from "lucide-react-native";
import { useColorScheme } from "~/lib/useColorScheme"; // Import useColorScheme
import { THEME_COLORS } from "~/lib/constants"; // Import THEME_COLORS

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
  const { isDarkColorScheme } = useColorScheme(); // Get theme status
  const colors = isDarkColorScheme ? THEME_COLORS.dark : THEME_COLORS.light; // Get current theme colors

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <View className="bg-card rounded-xl p-4 mb-4">
        <Text className="text-foreground mb-3">
          Remplissez votre nom complet et votre numéro de téléphone.
        </Text>

        <View>
          {/* Removed space-y-5, direct margin will be applied below */}
          <View className="relative mb-5">
            {/* Added mb-5 for bottom margin */}
            <Input
              value={clientName}
              onChangeText={setClientName}
              placeholder="Nom complet"
              className="pl-10 bg-input text-foreground placeholder:text-muted-foreground border-border"
            />
            <View className="absolute left-3 top-0 bottom-0 justify-center">
              <User size={18} color={colors["muted-foreground"]} />
            </View>
          </View>
          <View className="relative mb-5">
            {/* Added mb-5 for bottom margin */}
            <Input
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="Numéro de téléphone"
              keyboardType="phone-pad"
              className="pl-10 bg-input text-foreground placeholder:text-muted-foreground border-border"
            />
            <View className="absolute left-3 top-0 bottom-0 justify-center">
              <Phone size={18} color={colors["muted-foreground"]} />
            </View>
          </View>
        </View>
      </View>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <View className="flex-row items-center">
            <View className="h-6 w-6 rounded-full bg-primary items-center justify-center mr-2">
              <Check size={16} color={colors["primary-foreground"]} />
            </View>
            <Text className="text-foreground flex-1">
              Nous utilisons vos informations uniquement pour traiter votre
              commande et vous fournir des mises à jour de livraison.
            </Text>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
