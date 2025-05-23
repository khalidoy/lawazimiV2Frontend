import * as React from "react";
import { FlatList, View } from "react-native";
import { Text } from "~/components/ui/text";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";

// Mock data for orders
const ORDERS = [
  {
    id: "1",
    orderNumber: "ORD-2023-001",
    date: "2023-05-20",
    status: "delivered",
    items: [
      { id: "1", name: "Math Textbook Grade 10", quantity: 1 },
      { id: "2", name: "Premium Notebook Set", quantity: 2 },
    ],
    total: 50.99,
  },
  {
    id: "2",
    orderNumber: "ORD-2023-002",
    date: "2023-05-22",
    status: "processing",
    items: [{ id: "3", name: "Student Backpack", quantity: 1 }],
    total: 35.99,
  },
  {
    id: "3",
    orderNumber: "ORD-2023-003",
    date: "2023-05-25",
    status: "pending",
    items: [
      { id: "4", name: "Watercolor Paint Set", quantity: 1 },
      { id: "5", name: "Drawing Pencils", quantity: 1 },
    ],
    total: 28.5,
  },
];

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = React.useState("all");

  const filteredOrders = React.useMemo(() => {
    if (activeTab === "all") return ORDERS;
    return ORDERS.filter((order) => order.status === activeTab);
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge
            className="bg-green-500"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={14}
              className="mr-1"
              color={colors.card} // Assuming badge text color should contrast with primary
            />
            <Text style={{ color: colors.card }}>Delivered</Text>
          </Badge>
        );
      case "processing":
        return (
          <Badge
            className="bg-blue-500"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={14}
              className="mr-1"
              color={colors.card}
            />
            <Text style={{ color: colors.card }}>Processing</Text>
          </Badge>
        );
      case "pending":
        return (
          <Badge
            className="bg-yellow-500"
            style={{ backgroundColor: colors.notification }}
          >
            {" "}
            // Using notification color for pending
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              className="mr-1"
              color={colors.card} // Assuming badge text color should contrast
            />
            <Text style={{ color: colors.card }}>Pending</Text>
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }: { item: (typeof ORDERS)[0] }) => (
    <Card className="mb-4 mx-4" style={{ backgroundColor: colors.card }}>
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle style={{ color: colors.text }}>{item.orderNumber}</CardTitle>
        {getStatusBadge(item.status)}
      </CardHeader>
      <CardContent>
        <Text className="mb-1" style={{ color: colors.text }}>
          Date: {item.date}
        </Text>
        <Text className="mb-2 font-semibold" style={{ color: colors.text }}>
          Items:
        </Text>
        {item.items.map((orderItem) => (
          <View key={orderItem.id} className="flex-row justify-between mb-1">
            <Text style={{ color: colors.text }}>
              {orderItem.quantity}x {orderItem.name}
            </Text>
          </View>
        ))}
        <Text
          className="mt-2 font-bold text-lg"
          style={{ color: colors.primary }}
        >
          Total: ${item.total.toFixed(2)}
        </Text>
      </CardContent>
      <CardFooter className="flex-row justify-end space-x-2">
        <Button variant="outline" size="sm">
          <Text>View Details</Text>
        </Button>
        {item.status === "processing" && (
          <Button variant="default" size="sm">
            <Text>Track Order</Text>
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList
          className="mx-4 mt-4"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <TabsTrigger value="all">
            <Text
              style={{
                color: activeTab === "all" ? colors.primary : colors.text,
              }}
            >
              All Orders
            </Text>
          </TabsTrigger>
          <TabsTrigger value="processing">
            <Text
              style={{
                color:
                  activeTab === "processing" ? colors.primary : colors.text,
              }}
            >
              Processing
            </Text>
          </TabsTrigger>
          <TabsTrigger value="delivered">
            <Text
              style={{
                color: activeTab === "delivered" ? colors.primary : colors.text,
              }}
            >
              Delivered
            </Text>
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Text
              style={{
                color: activeTab === "pending" ? colors.primary : colors.text,
              }}
            >
              Pending
            </Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1">
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-10">
                <MaterialCommunityIcons
                  name="cart-off"
                  size={48}
                  color={colors.text} // Use themed color
                  className="mb-4"
                />
                <Text
                  className="text-lg font-medium"
                  style={{ color: colors.text }}
                >
                  No orders found.
                </Text>
                <Text
                  className="text-center mt-1"
                  style={{ color: colors.text }}
                >
                  You haven't placed any orders yet.
                </Text>
              </View>
            )}
          />
        </TabsContent>
        <TabsContent value="processing" className="flex-1">
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-10">
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={48}
                  color={colors.text} // Use themed color
                  className="mb-4"
                />
                <Text
                  className="text-lg font-medium"
                  style={{ color: colors.text }}
                >
                  No orders processing.
                </Text>
              </View>
            )}
          />
        </TabsContent>
        <TabsContent value="delivered" className="flex-1">
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-10">
                <MaterialCommunityIcons
                  name="check-all"
                  size={48}
                  color={colors.text} // Use themed color
                  className="mb-4"
                />
                <Text
                  className="text-lg font-medium"
                  style={{ color: colors.text }}
                >
                  No orders delivered yet.
                </Text>
              </View>
            )}
          />
        </TabsContent>
        <TabsContent value="pending" className="flex-1">
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-10">
                <MaterialCommunityIcons
                  name="timer-sand-empty"
                  size={48}
                  color={colors.text} // Use themed color
                  className="mb-4"
                />
                <Text
                  className="text-lg font-medium"
                  style={{ color: colors.text }}
                >
                  No pending orders.
                </Text>
              </View>
            )}
          />
        </TabsContent>
      </Tabs>
    </View>
  );
}
