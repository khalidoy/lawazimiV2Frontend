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
import { Clock, CheckCircle, Package } from "lucide-react-native";

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
  const [activeTab, setActiveTab] = React.useState("all");

  const filteredOrders = React.useMemo(() => {
    if (activeTab === "all") return ORDERS;
    return ORDERS.filter((order) => order.status === activeTab);
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-500">
            <CheckCircle size={14} className="mr-1" />
            <Text className="text-white">Delivered</Text>
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500">
            <Package size={14} className="mr-1" />
            <Text className="text-white">Processing</Text>
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock size={14} className="mr-1" />
            <Text className="text-white">Pending</Text>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold mb-4">My Orders</Text>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="mb-4">
          <TabsTrigger value="all" onPress={() => setActiveTab("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="pending" onPress={() => setActiveTab("pending")}>
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            onPress={() => setActiveTab("processing")}
          >
            Processing
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            onPress={() => setActiveTab("delivered")}
          >
            Delivered
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row justify-between items-center">
                <CardTitle>{item.orderNumber}</CardTitle>
                {getStatusBadge(item.status)}
              </View>
              <Text className="text-sm text-muted-foreground">
                Ordered on {item.date}
              </Text>
            </CardHeader>
            <CardContent>
              <Text className="font-medium mb-2">Items:</Text>
              {item.items.map((orderItem) => (
                <Text key={orderItem.id} className="text-sm">
                  {orderItem.quantity}x {orderItem.name}
                </Text>
              ))}
              <Text className="mt-2 text-lg font-semibold">
                Total: ${item.total.toFixed(2)}
              </Text>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Text>View Details</Text>
              </Button>
            </CardFooter>
          </Card>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-8">
            <Text className="text-muted-foreground">No orders found</Text>
          </View>
        )}
      />
    </View>
  );
}
