import React, { useState } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"; // Assuming Tabs are suitable for categories
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"; // Alternative for categories
import { Input } from "~/components/ui/input";
import { useRouter } from "expo-router";
import { useColorScheme } from "~/lib/useColorScheme";
import { THEME_COLORS } from "~/lib/constants";
import { ShoppingCart, Search, ChevronLeft, Filter } from "lucide-react-native"; // Example icons

// Placeholder data (replace with actual data source)
const CATEGORIES_DATA = [
  { id: "cat1", name: "Fruits", icon: "Apple" },
  { id: "cat2", name: "Vegetables", icon: "Carrot" },
  { id: "cat3", name: "Bakery", icon: "Sandwich" },
  { id: "cat4", name: "Dairy", icon: "Milk" },
  { id: "cat5", name: "Drinks", icon: "CupSoda" },
];

const PRODUCTS_DATA = [
  {
    id: "prod1",
    categoryId: "cat1",
    name: "Fresh Apples",
    price: "2.99",
    unit: "kg",
    image: "https://via.placeholder.com/150/FFC0CB/000000?Text=Apple",
  },
  {
    id: "prod2",
    categoryId: "cat1",
    name: "Bananas",
    price: "1.99",
    unit: "bunch",
    image: "https://via.placeholder.com/150/FFFF00/000000?Text=Banana",
  },
  {
    id: "prod3",
    categoryId: "cat2",
    name: "Carrots",
    price: "1.49",
    unit: "kg",
    image: "https://via.placeholder.com/150/FFA500/000000?Text=Carrot",
  },
  {
    id: "prod4",
    categoryId: "cat2",
    name: "Broccoli",
    price: "2.49",
    unit: "head",
    image: "https://via.placeholder.com/150/008000/FFFFFF?Text=Broccoli",
  },
  {
    id: "prod5",
    categoryId: "cat3",
    name: "Sourdough Bread",
    price: "4.99",
    unit: "loaf",
    image: "https://via.placeholder.com/150/DEB887/000000?Text=Bread",
  },
  {
    id: "prod6",
    categoryId: "cat4",
    name: "Organic Milk",
    price: "3.99",
    unit: "gallon",
    image: "https://via.placeholder.com/150/ADD8E6/000000?Text=Milk",
  },
  {
    id: "prod7",
    categoryId: "cat5",
    name: "Orange Juice",
    price: "3.49",
    unit: "bottle",
    image: "https://via.placeholder.com/150/FF8C00/FFFFFF?Text=Juice",
  },
  {
    id: "prod8",
    categoryId: "cat1",
    name: "Grapes",
    price: "3.20",
    unit: "kg",
    image: "https://via.placeholder.com/150/800080/FFFFFF?Text=Grapes",
  },
];

export default function StoreScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? THEME_COLORS.dark : THEME_COLORS.light;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    CATEGORIES_DATA[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<{ [productId: string]: number }>({}); // Explicitly type cart

  const filteredProducts = PRODUCTS_DATA.filter((product) => {
    const categoryMatch = selectedCategory
      ? product.categoryId === selectedCategory
      : true;
    const searchMatch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return categoryMatch && searchMatch;
  });

  const addToCart = (productId: string) => {
    setCart((prevCart: { [productId: string]: number }) => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart: { [productId: string]: number }) => {
      const newCart = { ...prevCart };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce(
      (sum: number, quantity: number) => sum + quantity,
      0
    );
  };

  // For Select component if Tabs are not preferred or for smaller screens
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* <SharedElement id="store-card-transition"> */}
      <View
        className="flex-row items-center justify-between p-4 border-b"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.foreground} />
        </Button>
        <Text
          className="text-xl font-semibold"
          style={{ color: colors.foreground }}
        >
          Lawazimi Store
        </Text>
        <Button
          variant="ghost"
          size="icon"
          onPress={() =>
            alert(
              "Cart view not implemented yet. Items: " + getTotalCartItems()
            )
          }
        >
          <ShoppingCart size={24} color={colors.foreground} />
          {getTotalCartItems() > 0 && (
            <View className="absolute top-0 right-0 bg-destructive rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-destructive-foreground text-xs">
                {getTotalCartItems()}
              </Text>
            </View>
          )}
        </Button>
      </View>
      {/* </SharedElement> */}

      <View className="p-4">
        <View className="flex-row items-center mb-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 mr-2 bg-card border-border text-foreground placeholder:text-muted-foreground"
            // iconLeft={<Search size={18} color={colors.mutedForeground} />}
          />
          {/* <Button variant="outline" size="icon"> 
            <Filter size={20} color={colors.foreground} />
          </Button> */}
        </View>

        {/* Category Selection using Tabs (example) */}
        <View className="mb-4">
          <Text
            className="text-lg font-medium mb-2"
            style={{ color: colors.foreground }}
          >
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              onPress={() => setSelectedCategory(null)}
              className={!selectedCategory ? "bg-primary" : "border-primary"}
            >
              <Text
                className={
                  !selectedCategory ? "text-primary-foreground" : "text-primary"
                }
              >
                All
              </Text>
            </Button>
            {CATEGORIES_DATA.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onPress={() => setSelectedCategory(cat.id)}
                className={
                  selectedCategory === cat.id ? "bg-primary" : "border-primary"
                }
              >
                {/* Icon can be added here if you have a mapping */}
                <Text
                  className={
                    selectedCategory === cat.id
                      ? "text-primary-foreground"
                      : "text-primary"
                  }
                >
                  {cat.name}
                </Text>
              </Button>
            ))}
          </ScrollView>
        </View>

        {/* Alternative Category Selection using Select (uncomment to use) */}
        {/* <View className="mb-4">
          <Text className="text-lg font-medium mb-2" style={{ color: colors.foreground }}>Categories (Select)</Text>
          <Select onValueChange={handleCategoryChange} value={selectedCategory || 'all'}>
            <SelectTrigger className="w-full bg-card border-border">
              <SelectValue placeholder="Select a category" style={{ color: colors.foreground }} />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: colors.popover, borderColor: colors.border }}>
              <SelectItem value="all" style={{ color: colors.popoverForeground }}>All Categories</SelectItem>
              {CATEGORIES_DATA.map(cat => (
                <SelectItem key={cat.id} value={cat.id} style={{ color: colors.popoverForeground }}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </View> */}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      >
        {filteredProducts.length === 0 && (
          <View className="items-center justify-center py-10">
            <Text className="text-lg text-muted-foreground">
              No products found.
            </Text>
            {searchTerm && (
              <Text className="text-sm text-muted-foreground">
                (Try adjusting your search or filters)
              </Text>
            )}
          </View>
        )}
        <View className="flex-row flex-wrap justify-between">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="w-[48%] mb-4 bg-card border-border"
              style={{ borderColor: colors.border }}
            >
              <CardHeader className="p-0">
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-32 rounded-t-md"
                  resizeMode="cover"
                />
              </CardHeader>
              <CardContent className="p-3">
                <Text
                  className="text-base font-semibold mb-1"
                  style={{ color: colors.foreground }}
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text
                  className="text-sm mb-1"
                  style={{ color: colors.mutedForeground }} // This should be colors.mutedForeground if it exists in your THEME_COLORS, or use a direct value/tailwind class
                >
                  {product.unit}
                </Text>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.primary }}
                >
                  ${product.price}
                </Text>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                {cart[product.id] ? (
                  <View className="flex-row items-center justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => removeFromCart(product.id)}
                      className="border-primary"
                    >
                      <Text className="text-primary">-</Text>
                    </Button>
                    <Text className="font-semibold text-foreground mx-2">
                      {cart[product.id]}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => addToCart(product.id)}
                      className="border-primary"
                    >
                      <Text className="text-primary">+</Text>
                    </Button>
                  </View>
                ) : (
                  <Button
                    variant="default"
                    onPress={() => addToCart(product.id)}
                    className="w-full bg-primary"
                  >
                    <Text className="text-primary-foreground">Add to Cart</Text>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
