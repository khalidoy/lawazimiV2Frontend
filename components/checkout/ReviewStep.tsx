import * as React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";

interface ReviewStepProps {
  onComplete: () => void;
  customerInfo: {
    name: string;
    phone: string;
  };
  deliveryLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  items: any[];
  images: string[];
}

export default function ReviewStep({
  onComplete,
  customerInfo,
  deliveryLocation,
  items,
  images,
}: ReviewStepProps) {
  const { colors } = useTheme(); // from @react-navigation/native

  // Generate order summary based on props
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const deliveryFee = 5.0;
    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    };
  };

  const totals = calculateTotals();

  // Format address based on coordinates
  const formatAddress = () => {
    if (!deliveryLocation.latitude || !deliveryLocation.longitude) {
      return "Address not set";
    }
    // In a real app, you'd reverse geocode these coordinates
    return `Location at ${deliveryLocation.latitude.toFixed(
      4
    )}, ${deliveryLocation.longitude.toFixed(4)}`;
  };

  return (
    <ScrollView
      className="flex-1 p-4"
      style={{ backgroundColor: colors.background }}
    >
      <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
        Review Your Order
      </Text>

      {/* Order Items */}
      <Card className="mb-4" style={{ backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle style={{ color: colors.text }}>Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            items.map((item, index) => (
              <View
                key={item.id || index}
                className="flex-row justify-between mb-2"
              >
                <Text style={{ color: colors.text }}>1x {item.name}</Text>
                <Text className="font-semibold" style={{ color: colors.text }}>
                  ${item.price?.toFixed(2)}
                </Text>
              </View>
            ))
          ) : images.length > 0 ? (
            <Text style={{ color: colors.text }}>
              Order based on uploaded image(s) - {images.length} image(s)
            </Text>
          ) : (
            <Text style={{ color: colors.text }}>No items selected</Text>
          )}
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card className="mb-4" style={{ backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle style={{ color: colors.text }}>
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              className="mr-3"
              color={colors.text}
            />
            <View className="flex-1">
              <Text className="font-medium" style={{ color: colors.text }}>
                {customerInfo.name || "Name not provided"}
              </Text>
              <Text
                className="text-muted-foreground text-sm"
                style={{ color: colors.text }}
              >
                {customerInfo.phone || "Phone not provided"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              className="mr-3"
              color={colors.text}
            />
            <Text className="flex-1" style={{ color: colors.text }}>
              {formatAddress()}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={20}
              className="mr-3"
              color={colors.text}
            />
            <Text className="flex-1" style={{ color: colors.text }}>
              Estimated delivery: Tomorrow
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="credit-card-outline"
              size={20}
              className="mr-3"
              color={colors.text}
            />
            <Text className="flex-1" style={{ color: colors.text }}>
              Cash on Delivery
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-4" style={{ backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle style={{ color: colors.text }}>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-between mb-2">
            <Text
              className="text-muted-foreground"
              style={{ color: colors.text }}
            >
              Subtotal
            </Text>
            <Text style={{ color: colors.text }}>
              ${totals.subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text
              className="text-muted-foreground"
              style={{ color: colors.text }}
            >
              Delivery Fee
            </Text>
            <Text style={{ color: colors.text }}>
              ${totals.deliveryFee.toFixed(2)}
            </Text>
          </View>

          <Separator
            className="my-2"
            style={{ backgroundColor: colors.border }}
          />

          <View className="flex-row justify-between mt-2">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>
              Total
            </Text>
            <Text
              className="font-bold text-lg"
              style={{ color: colors.primary }}
            >
              ${totals.total.toFixed(2)}
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Submit Button - Ensure it uses theme colors if it's a custom button */}
      {/* If using a pre-styled Button from a library, it might adapt automatically or need specific props */}
      <Button
        onPress={onComplete}
        size="lg"
        className="mt-4 w-full self-center"
      >
        <Text>Complete Order</Text>
      </Button>
    </ScrollView>
  );
}
