import React, { useState } from "react";
import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";

// Sample data
const CATEGORIES = [
  { id: "cat1", name: "Fruits" },
  { id: "cat2", name: "Vegetables" },
  { id: "cat3", name: "Bakery" },
];
const PRODUCTS = [
  {
    id: "p1",
    categoryId: "cat1",
    name: "Apple",
    price: "2.99",
    unit: "kg",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "p2",
    categoryId: "cat2",
    name: "Carrot",
    price: "1.49",
    unit: "kg",
    image: "https://via.placeholder.com/150",
  },
];

export default function StoreScreen() {
  const router = useRouter();
  const { colors } = useTheme(); // Use colors from useTheme for consistency

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    CATEGORIES[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = PRODUCTS.filter(
    (p) =>
      (!selectedCategory || p.categoryId === selectedCategory) &&
      (!searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card, // Use theme color for card background
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>
          Lawazimi Store
        </Text>
        <MaterialCommunityIcons
          name="cart-outline"
          size={24}
          color={colors.text}
        />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        style={{ backgroundColor: colors.background }}
      >
        {filtered.map((item) => (
          <Card
            key={item.id}
            style={{
              marginBottom: 16,
              backgroundColor: colors.card,
              borderColor: colors.border,
            }} // Added borderColor
          >
            <CardHeader>
              <CardTitle style={{ color: colors.text }}>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                source={{ uri: item.image }}
                style={{ width: "100%", height: 150, marginBottom: 8 }} // Added margin
              />
              <Text style={{ color: colors.text }}>
                {item.price} € / {item.unit}
              </Text>
            </CardContent>
            <CardFooter>
              <Button
                onPress={() => console.log("Add to cart", item.id)}
                style={{ backgroundColor: colors.primary }}
              >
                <Text style={{ color: NAV_THEME.dark.text }}>Ajouter</Text>
                {/* Assuming button text should be light on primary bg */}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
