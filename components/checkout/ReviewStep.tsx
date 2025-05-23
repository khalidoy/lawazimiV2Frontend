import * as React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { MapPin, User, Calendar, CreditCard } from "lucide-react-native";

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
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">Review Your Order</Text>

      {/* Order Items */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            items.map((item, index) => (
              <View
                key={item.id || index}
                className="flex-row justify-between mb-2"
              >
                <Text>1x {item.name}</Text>
                <Text className="font-semibold">${item.price?.toFixed(2)}</Text>
              </View>
            ))
          ) : images.length > 0 ? (
            <Text>
              Order based on uploaded image(s) - {images.length} image(s)
            </Text>
          ) : (
            <Text>No items selected</Text>
          )}
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <View className="flex-row">
            <User size={16} className="mr-3" color="#888" />
            <View className="flex-1">
              <Text className="font-medium">
                {customerInfo.name || "Name not provided"}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {customerInfo.phone || "Phone not provided"}
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <MapPin size={16} className="mr-3" color="#888" />
            <Text className="flex-1">{formatAddress()}</Text>
          </View>

          <View className="flex-row">
            <Calendar size={16} className="mr-3" color="#888" />
            <Text className="flex-1">Estimated delivery: Tomorrow</Text>
          </View>

          <View className="flex-row">
            <CreditCard size={16} className="mr-3" color="#888" />
            <Text className="flex-1">Cash on Delivery</Text>
          </View>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Subtotal</Text>
            <Text>${totals.subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Delivery Fee</Text>
            <Text>${totals.deliveryFee.toFixed(2)}</Text>
          </View>

          <Separator className="my-2" />

          <View className="flex-row justify-between mt-2">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg text-primary">
              ${totals.total.toFixed(2)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
